import { FamilyRole } from '../../../family/domain/entities/family.types';

/**
 * Alta de un usuario desde el panel de plataforma. El backend exige asignarlo a una
 * familia al crearlo: una cuenta sin familia no podría ver ni ser vista por nadie.
 */
export interface AdminCreateUserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  familyId: string;
  familyRole: FamilyRole;
}

/** Campos editables de un usuario. Los omitidos no se modifican. */
export interface AdminUpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}
