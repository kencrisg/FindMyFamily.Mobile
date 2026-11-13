/** Rol DENTRO de una familia. No confundir con el rol de plataforma (super admin). */
export type FamilyRole = 'admin' | 'member';

export interface FamilyMemberSummary {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: FamilyRole | string;
  joinedAt: string;
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
  membersCount: number;
}

export interface FamilyDetail {
  id: string;
  name: string;
  createdAt: string;
  members: FamilyMemberSummary[];
}

export interface CreateFamilyData {
  name: string;
}

export interface AddFamilyMemberData {
  phoneNumber: string;
  role?: FamilyRole;
}

export interface CreateFamilyMemberUserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}

/** Campos que se pueden editar de un miembro. Los omitidos no se modifican. */
export interface UpdateFamilyMemberUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}
