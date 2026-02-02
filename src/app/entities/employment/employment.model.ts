export interface IEmployment {
  id: number;
  organizationName?: string | null;
  designation?: string | null;
  officialTelephone?: string | null;
  officialAddress?: string | null;
}

export type NewEmployment = Omit<IEmployment, 'id'> & { id: null };
