import { IDocument, NewDocument } from './document.model';

export const sampleWithRequiredData: IDocument = {
  id: 26644,
};

export const sampleWithPartialData: IDocument = {
  id: 1969,
  fileUrl: 'oddly',
};

export const sampleWithFullData: IDocument = {
  id: 31599,
  fileName: 'chasuble',
  fileUrl: 'happy-go-lucky mallard forenenst',
  documentType: 'CERTIFICATE',
};

export const sampleWithNewData: NewDocument = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
