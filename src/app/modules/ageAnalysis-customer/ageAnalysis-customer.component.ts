import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs/esm';
import { ICustomerPayments } from 'app/entities/financemicro/customer-payments/customer-payments.model';
import { CustomerPaymentsService } from 'app/entities/financemicro/customer-payments/service/customer-payments.service';
import { InvoiceService } from 'app/entities/operationsModuleCooperation/invoice/service/invoice.service';
import { IInvoice } from 'app/entities/operationsModuleCooperation/invoice/invoice.model';
import { forkJoin } from 'rxjs';

interface ICustomerAging {

    customerName: string;
    payments: ICustomerPaymentAging[];
    total: number;
    outstanding: number;
    aging: {
        '0-30': number;
        '30-60': number;
        '60-90': number;
        '90+': number;
    };
    InvoiceCode: ICustomerInvoiceAging[];
}
interface ICustomerPaymentAging extends Omit<ICustomerPayments, 'id'> {
  id?: number;   
  days: number;
  invoiceCode?: string | null;
  amountOwing?: number | null;
  balance?: number;
}


interface ICustomerInvoiceAging {
    invoiceCode?: string | null;
    amountOwing?: number | null;

}

@Component({
    selector: 'app-ageAnalysis-customer',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './ageAnalysis-customer.component.html',
    styleUrls: ['./ageAnalysis-customer.component.scss']
})
export class AgeAnalysisCustomerComponent implements OnInit {
    fb = inject(FormBuilder);
    customerPaymentsService = inject(CustomerPaymentsService);
    invoiceService = inject(InvoiceService);
    grnForm: FormGroup;

    todayDate = dayjs().format('YYYY-MM-DD');
    currentTime = dayjs().format('HH:mm:ss');

    flatRelatedData: ICustomerPayments[] = [];
    invoices: IInvoice[] = [];
    groupedData: ICustomerAging[] = [];

    isLoading = true;
    hasError = false;

    displayedColumns: string[] = [
        'date', 'invoiceCode', 'days',
        'total', 'outstanding', '0-30', '30-60', '60-90', 'over90', 'balance'
    ];

    ngOnInit(): void {
        this.grnForm = this.fb.group({
            grnStartDate: [dayjs().startOf('month')],
            grnEndDate: [dayjs()]
        });

        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;

        const paymentsParams = {
            size: 10000, // load all for report
            sort: 'date,asc'
        };

        const invoiceParams = {
            size: 10000, // load all for report
            sort: 'invoiceDate,asc'
        };

        forkJoin({
            payments: this.customerPaymentsService.query(paymentsParams),
            invoices: this.invoiceService.query(invoiceParams)
        }).subscribe({
            next: ({ payments, invoices }) => {
                const paymentData = payments.body ?? [];
                const invoiceData = invoices.body ?? [];

                this.flatRelatedData = paymentData.map(p => ({
                    ...p,
                    date: p.date ? dayjs(p.date) : dayjs(),
                    days: p.date ? dayjs().diff(p.date, 'day') : 0
                }));

                this.invoices = invoiceData;

                this.groupDataByCustomer(this.flatRelatedData, this.invoices);
                this.isLoading = false;
            },
            error: err => {
                console.error('Failed to load data', err);
                this.hasError = true;
                this.isLoading = false;
            }
        });
    }


    groupDataByCustomer(payments: ICustomerPayments[], invoices: IInvoice[]): void {
        const invoiceBalanceMap = new Map<string, number>();

        const grouped: Record<string, ICustomerAging> = {};
        const invoiceByCode = new Map<string, IInvoice>();

        invoices.forEach(invoice => {
            if (invoice.invoiceNumber) {
                invoiceByCode.set(invoice.invoiceNumber, invoice);
            }
        });

        const invoiceAggMap = new Map<
  string,
  {
    customer: string;
    invoiceDate: dayjs.Dayjs;
    totalPaid: number;
    latestOutstanding: number;
    lastPaymentDate: dayjs.Dayjs;
  }
>();


        // First, group Invoices by customer to collect invoice codes
        const invoiceByCustomer: Record<string, IInvoice[]> = {};
        invoices.forEach(invoice => {
            const customer = invoice.vehicleOwnerName ?? 'Unknown Customer';
            if (!invoiceByCustomer[customer]) {
                invoiceByCustomer[customer] = [];
            }
            invoiceByCustomer[customer].push(invoice);
        });

        payments.forEach(p => {
  if (!p.invoiceCode) return;

  const invoice = invoiceByCode.get(p.invoiceCode);
  if (!invoice) return;

  const customer = invoice.vehicleOwnerName ?? 'Unknown Customer';
  const invoiceDate = invoice.invoiceDate
    ? dayjs(invoice.invoiceDate)
    : dayjs();

  const invoiceTotal = invoice.totalNetAmount ?? 0;
  const paymentAmount = p.amount ?? 0;

  // init aggregation
  if (!invoiceAggMap.has(p.invoiceCode)) {
    invoiceAggMap.set(p.invoiceCode, {
      customer,
      invoiceDate,
      totalPaid: 0,
      latestOutstanding: invoiceTotal,
      lastPaymentDate: dayjs(p.date),
    });
  }

  const agg = invoiceAggMap.get(p.invoiceCode)!;

  agg.totalPaid += paymentAmount;
  agg.latestOutstanding -= paymentAmount;

  // track last payment date
  if (dayjs(p.date).isAfter(agg.lastPaymentDate)) {
    agg.lastPaymentDate = dayjs(p.date);
  }
});
invoiceAggMap.forEach((agg, invoiceCode) => {
  const days = dayjs().diff(agg.invoiceDate, 'day');

  if (!grouped[agg.customer]) {
    grouped[agg.customer] = {
      customerName: agg.customer,
      payments: [],
      total: 0,
      outstanding: 0,
      aging: { '0-30': 0, '30-60': 0, '60-90': 0, '90+': 0 },
      InvoiceCode: [],
    };
  }

  grouped[agg.customer].payments.push({
    date: agg.invoiceDate, 
    invoiceCode,
    days,
    amount: agg.totalPaid,               // TOTAL = sum of payments
    amountOwing: agg.latestOutstanding,  // latest outstanding
    balance: agg.latestOutstanding,
  });

  grouped[agg.customer].total += agg.totalPaid;
  grouped[agg.customer].outstanding += agg.latestOutstanding;

  if (days <= 30) grouped[agg.customer].aging['0-30'] += agg.latestOutstanding;
  else if (days <= 60) grouped[agg.customer].aging['30-60'] += agg.latestOutstanding;
  else if (days <= 90) grouped[agg.customer].aging['60-90'] += agg.latestOutstanding;
  else grouped[agg.customer].aging['90+'] += agg.latestOutstanding;
});

        this.groupedData = Object.values(grouped);
        console.log(this.groupedData);
    }

    getCustomerTotals(customer: ICustomerAging) {
        return customer.payments.reduce(
            (acc, p) => {
                const amount = p.amount ?? 0;
                const outstanding = p.amountOwing ?? 0;
                const balance = p.balance ?? 0;
                const days = p.days ?? 0;

                acc.total += amount;
                acc.outstanding += outstanding;
                acc.balance += balance;

                if (days <= 30) acc['0-30'] += amount;
                else if (days <= 60) acc['30-60'] += amount;
                else if (days <= 90) acc['60-90'] += amount;
                else acc['90+'] += amount;

                return acc;
            },
            {
                total: 0,
                outstanding: 0,
                balance: 0,
                '0-30': 0,
                '30-60': 0,
                '60-90': 0,
                '90+': 0,
            }
        );
    }


    formatCurrency(value: number | undefined): string {
        return value != null ? value.toFixed(2) : '0.00';
    }
    printReport(): void {
        window.print();
    }
}