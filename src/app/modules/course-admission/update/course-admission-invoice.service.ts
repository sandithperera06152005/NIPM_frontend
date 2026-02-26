import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CourseAdmissionInvoice {
  id?: number;                
  invoiceNo: string;             
  issuedDate: string;          
  dueDate: string;             
  totalAmount: number;         
  paidAmount: number;
  courseAdmission?: { id: number } | null;          
}

@Injectable({
  providedIn: 'root',
})
export class CourseAdmissionInvoiceService {
  private http = inject(HttpClient);
  private baseUrl = '/api/invoices'; 

create(invoice: CourseAdmissionInvoice): Observable<CourseAdmissionInvoice> {
    return this.http.post<CourseAdmissionInvoice>(this.baseUrl, invoice);
  }

  
}
