import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { IInvoice, NewInvoice } from '../invoice.model';
import { IDocument } from 'app/entities/document/document.model';

export type PartialUpdateInvoice = Partial<IInvoice> & Pick<IInvoice, 'id'>;

// Convert Dayjs objects to strings for REST
type RestOf<T extends IInvoice | NewInvoice | PartialUpdateInvoice> = Omit<T, 'issuedDate' | 'dueDate'> & {
  issuedDate?: string | null;
  dueDate?: string | null;
};

export type RestInvoice = RestOf<IInvoice>;
export type NewRestInvoice = RestOf<NewInvoice>;
export type PartialUpdateRestInvoice = RestOf<PartialUpdateInvoice>;

export type EntityResponseType = HttpResponse<IInvoice>;
export type EntityArrayResponseType = HttpResponse<IInvoice[]>;

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  protected readonly http = inject(HttpClient);


  protected resourceUrl = 'api/invoices';

  // Create a new invoice
  create(payload: NewInvoice): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http
      .post<RestInvoice>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  // Update an existing invoice
  update(payload: IInvoice): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payload);
    return this.http
      .put<RestInvoice>(`${this.resourceUrl}/${payload.id}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

 // Find invoice by ID
  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestInvoice>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  // Query all invoices
  query(req?: any): Observable<EntityArrayResponseType> {
    const options = this.createRequestOption(req);
    return this.http
      .get<RestInvoice[]>(this.resourceUrl, { params: req, observe: 'response'})
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }
  

  // Delete invoice
  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // Get invoices by NIC
  getByNic(nic: string): Observable<IInvoice[]> {
    return this.http.get<IInvoice[]>(`${this.resourceUrl}/by-nic/${nic}`);
  }
  
getInvoiceIdByInvoiceNo(invoiceNo: string): Observable<number> {
  return this.http.get<number>(`/api/invoices/by-invoice-no/${invoiceNo}`);
}



  // Helper: Convert request object to HttpParams
  protected createRequestOption(req?: any): HttpParams {
    let options: HttpParams = new HttpParams();
    if (req) {
      Object.keys(req).forEach(key => {
        if (req[key] !== null && req[key] !== undefined) {
          options = options.set(key, req[key]);
        }
      });
    }
    return options;
  }

  // --- Date Conversion Helpers ---
  protected convertDateFromClient<T extends IInvoice | NewInvoice | PartialUpdateInvoice>(entity: T): RestOf<T> {
    const copy: any = { ...entity };
    if (dayjs.isDayjs(entity.issuedDate)) {
      copy.issuedDate = entity.issuedDate.toJSON();
    }
    if (dayjs.isDayjs(entity.dueDate)) {
      copy.dueDate = entity.dueDate.toJSON();
    }
    return copy;
  }

  protected convertDateFromServer(restEntity: RestInvoice): IInvoice {
    const entity: any = { ...restEntity };
    if (entity.issuedDate) {
      entity.issuedDate = dayjs(entity.issuedDate);
    }
    if (entity.dueDate) {
      entity.dueDate = dayjs(entity.dueDate);
    }
    return entity;
  }

  protected convertResponseFromServer(res: HttpResponse<RestInvoice>): HttpResponse<IInvoice> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestInvoice[]>): HttpResponse<IInvoice[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}