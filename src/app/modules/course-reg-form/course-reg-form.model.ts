export interface ICourseRegForm {
  id: number;
  formName?: string | null;
  fileUploadPath?: string | null;
  formPath?: string | null;
}

export type NewCourseRegForm = Omit<ICourseRegForm, 'id'> & { id: null };
