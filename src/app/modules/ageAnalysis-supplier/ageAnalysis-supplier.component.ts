import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs/esm';
import { VendorPaymentsComponent } from '../vendor-payments/vendor-payments.component';
import { IVendorPayments } from 'app/entities/financemicro/vendor-payments/vendor-payments.model';
import { VendorPaymentsService } from 'app/entities/financemicro/vendor-payments/service/vendor-payments.service';
import { GRNService } from 'app/entities/inventorymicro/grn/service/grn.service';
import { IGRN } from 'app/entities/inventorymicro/grn/grn.model';
import { forkJoin } from 'rxjs';

interface IVendorAging {

  supplierName: string;
  payments: IVendorPaymentAging[];
  total: number;
  outstanding: number;
  aging: {
    '0-30': number;
    '30-60': number;
    '60-90': number;
    '90+': number;
  };
  InvoiceCode: IVendorInvoiceAging[];
}
interface IVendorPaymentAging extends IVendorPayments {
  days: number;
  invoiceCode?: string | null;
  supplierInvoiceCode?: string | null;
  amountOwing?: number | null;
  balance?: number;
}

interface IVendorInvoiceAging {
  invoiceCode?: string | null;
  supplierInvoiceCode?: string | null;
}

@Component({
  selector: 'app-ageAnalysis-supplier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './ageAnalysis-supplier.component.html',
  styleUrls: ['./ageAnalysis-supplier.component.scss']
})
export class AgeAnalysisSupplierComponent implements OnInit {
  fb = inject(FormBuilder);
  vendorPaymentsService = inject(VendorPaymentsService);
  GRNService = inject(GRNService);
  grnForm: FormGroup;

  todayDate = dayjs().format('YYYY-MM-DD');
  currentTime = dayjs().format('HH:mm:ss');

  flatRelatedData: IVendorPayments[] = [];
  grns: IGRN[] = [];
  groupedData: IVendorAging[] = [];

  isLoading = true;
  hasError = false;

  displayedColumns: string[] = [
    'date', 'grnCode', 'supplierInvoiceCode', 'days',
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

    const grnParams = {
      size: 10000, // load all for report
      sort: 'grnDate,asc'
    };

    forkJoin({
      payments: this.vendorPaymentsService.query(paymentsParams),
      grns: this.GRNService.query(grnParams)
    }).subscribe({
      next: ({ payments, grns }) => {
        const paymentData = payments.body ?? [];
        const grnData = grns.body ?? [];

        this.flatRelatedData = paymentData.map(p => ({
          ...p,
          date: p.date ? dayjs(p.date) : dayjs(),
          days: p.date ? dayjs().diff(p.date, 'day') : 0
        }));

        this.grns = grnData;

        this.groupDataBySupplier(this.flatRelatedData, this.grns);
        this.isLoading = false;
      },
      error: err => {
        console.error('Failed to load data', err);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }


  groupDataBySupplier(payments: IVendorPayments[], grns: IGRN[]): void {
    const grnBalanceMap = new Map<string, number>();

    const grouped: Record<string, IVendorAging> = {};
    const grnByCode = new Map<string, IGRN>();

    grns.forEach(grn => {
      if (grn.grnCode) {
        grnByCode.set(grn.grnCode, grn);
      }
    });

    // First, group GRNs by supplier to collect invoice codes
    const grnBySupplier: Record<string, IGRN[]> = {};
    grns.forEach(grn => {
      const supplier = grn.supplierName ?? 'Unknown Supplier';
      if (!grnBySupplier[supplier]) {
        grnBySupplier[supplier] = [];
      }
      grnBySupplier[supplier].push(grn);
    });

    payments.forEach(p => {
      const relatedGrn = p.grnCode ? grnByCode.get(p.grnCode) : null;
      const supplier = relatedGrn?.supplierName ?? p.description ?? 'Unknown Supplier';
      const days = p.date ? dayjs().diff(p.date, 'day') : 0;
      const amount = p.owing ?? 0;

      if (!grouped[supplier]) {
        grouped[supplier] = {
          supplierName: supplier,
          payments: [],
          total: 0,
          outstanding: 0,
          aging: { '0-30': 0, '30-60': 0, '60-90': 0, '90+': 0 },
          InvoiceCode: [],
        };

        // Add invoice codes from GRNs for this supplier
        if (grnBySupplier[supplier]) {
          grnBySupplier[supplier].forEach(grn => {
            if (grn.invoiceCode || grn.supplierInvoiceCode) {
              grouped[supplier].InvoiceCode.push({
                invoiceCode: grn.invoiceCode,
                supplierInvoiceCode: grn.supplierInvoiceCode,
              });
            }
          });
        }
      }

      const paymentAmount = p.amount ?? 0;
      const grnCode = p.grnCode ?? '';
      const grnTotal = relatedGrn?.amountOwing ?? 0;

      // initialize GRN balance once
      if (!grnBalanceMap.has(grnCode)) {
        grnBalanceMap.set(grnCode, grnTotal);
      }

      const previousBalance = grnBalanceMap.get(grnCode)!;
      const newBalance = previousBalance - paymentAmount;

      // update for next row
      grnBalanceMap.set(grnCode, newBalance);

      grouped[supplier].payments.push({
        ...p,
        days,
        invoiceCode: relatedGrn?.invoiceCode ?? null,
        supplierInvoiceCode: relatedGrn?.supplierInvoiceCode ?? null,

        // TOTAL → payment made
        amount: paymentAmount,

        // OUTSTANDING → running GRN balance
        amountOwing: newBalance,

        // BALANCE → same running balance
        balance: newBalance,
      });


      grouped[supplier].total += paymentAmount;
      grouped[supplier].outstanding = newBalance;

      if (previousBalance === grnTotal) {
        if (days <= 30) grouped[supplier].aging['0-30'] += grnTotal;
        else if (days <= 60) grouped[supplier].aging['30-60'] += grnTotal;
        else if (days <= 90) grouped[supplier].aging['60-90'] += grnTotal;
        else grouped[supplier].aging['90+'] += grnTotal;
      }

    });

    this.groupedData = Object.values(grouped);
    console.log(this.groupedData);
  }

  getVendorTotals(vendor: IVendorAging) {
    return vendor.payments.reduce(
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
