import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentTransferService {
  private paymentsSource = new BehaviorSubject<any[]>([]);
  payments$ = this.paymentsSource.asObservable();

  private payments: any[] = [];
  private totalSettlementValue: number = 0;

  constructor() {
    this.getPaymentsFromStorage(); // restore data if user reloads page
  }

  setPayments(payments: any[], total: number): void {
    this.payments = payments;
    this.totalSettlementValue = total;
    
    // Update both BehaviorSubject and localStorage
    this.paymentsSource.next(payments);
    localStorage.setItem('tempPayments', JSON.stringify(payments));
    localStorage.setItem('totalSettlement', total.toString());
    
    console.log('Service: Payments stored', { payments, total });
  }

  getPayments(): any[] {
    // Return from memory first, then try localStorage
    if (this.payments.length > 0) {
      return this.payments;
    }
    
    const stored = localStorage.getItem('tempPayments');
    if (stored) {
      this.payments = JSON.parse(stored);
      return this.payments;
    }
    
    return [];
  }

  getTotalSettlementValue(): number {
    // Return from memory first, then try localStorage
    if (this.totalSettlementValue > 0) {
      return this.totalSettlementValue;
    }
    
    const stored = localStorage.getItem('totalSettlement');
    if (stored) {
      this.totalSettlementValue = parseFloat(stored);
      return this.totalSettlementValue;
    }
    
    return 0;
  }

  getPaymentsFromStorage() {
    const paymentsData = localStorage.getItem('tempPayments');
    const totalData = localStorage.getItem('totalSettlement');
    
    if (paymentsData) {
      this.payments = JSON.parse(paymentsData);
      this.paymentsSource.next(this.payments);
    }
    
    if (totalData) {
      this.totalSettlementValue = parseFloat(totalData);
    }
    
    console.log('Service: Data loaded from storage', { 
      payments: this.payments, 
      total: this.totalSettlementValue 
    });
  }

  clearPayments() {
    this.payments = [];
    this.totalSettlementValue = 0;
    this.paymentsSource.next([]);
    
    localStorage.removeItem('tempPayments');
    localStorage.removeItem('totalSettlement');
    
    console.log('Service: Payments cleared');
  }
}