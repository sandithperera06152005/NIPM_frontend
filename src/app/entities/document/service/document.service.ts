import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError, map } from 'rxjs/operators';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { SearchWithPagination } from 'app/core/request/request.model';
import { IDocument, NewDocument } from '../document.model';

export type PartialUpdateDocument = Partial<IDocument> & Pick<IDocument, 'id'>;

export type EntityResponseType = HttpResponse<IDocument>;
export type EntityArrayResponseType = HttpResponse<IDocument[]>;

@Injectable({ providedIn: 'root' })
export class DocumentService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/documents');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/documents/_search');
  protected fileUploadUrl = this.applicationConfigService.getEndpointFor('api/documents/upload');

  create(document: NewDocument): Observable<EntityResponseType> {
    return this.http.post<IDocument>(this.resourceUrl, document, { observe: 'response' });
  }

  update(document: IDocument): Observable<EntityResponseType> {
    return this.http.put<IDocument>(`${this.resourceUrl}/${this.getDocumentIdentifier(document)}`, document, { observe: 'response' });
  }

  // upload(formData: FormData): Observable<{ fileUrl: string }> {
  //   return this.http.post<{ fileUrl: string }>(this.fileUploadUrl, formData);
  // }
  upload(formData: FormData): Observable<IDocument> {
    return this.http.post<IDocument>(`${this.resourceUrl}/upload`, formData);
  }

  partialUpdate(document: PartialUpdateDocument): Observable<EntityResponseType> {
    return this.http.patch<IDocument>(`${this.resourceUrl}/${this.getDocumentIdentifier(document)}`, document, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IDocument>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IDocument[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IDocument[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IDocument[]>()], asapScheduler)));
  }

  getDocumentIdentifier(document: Pick<IDocument, 'id'>): number {
    return document.id;
  }

  compareDocument(o1: Pick<IDocument, 'id'> | null, o2: Pick<IDocument, 'id'> | null): boolean {
    return o1 && o2 ? this.getDocumentIdentifier(o1) === this.getDocumentIdentifier(o2) : o1 === o2;
  }

  getDocumentByInvoiceId(invoiceId: number): Observable<IDocument | null> {
    return this.http.get<IDocument[]>(`${this.resourceUrl}/invoice/${invoiceId}`).pipe(map(documents => documents?.[0] ?? null));
  }

  getDocumentsByInvoiceId(invoiceId: number): Observable<IDocument[]> {
    return this.http.get<IDocument[]>(`${this.resourceUrl}/invoice/${invoiceId}`);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.resourceUrl}/download/${id}`, {
      responseType: 'blob',
    });
  }


  addDocumentToCollectionIfMissing<Type extends Pick<IDocument, 'id'>>(
    documentCollection: Type[],
    ...documentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const documents: Type[] = documentsToCheck.filter(isPresent);
    if (documents.length > 0) {
      const documentCollectionIdentifiers = documentCollection.map(documentItem => this.getDocumentIdentifier(documentItem));
      const documentsToAdd = documents.filter(documentItem => {
        const documentIdentifier = this.getDocumentIdentifier(documentItem);
        if (documentCollectionIdentifiers.includes(documentIdentifier)) {
          return false;
        }
        documentCollectionIdentifiers.push(documentIdentifier);
        return true;
      });
      return [...documentsToAdd, ...documentCollection];
    }
    return documentCollection;
  }
}
