import { FamilyRole } from '../../domain/entities/family.types';

export const FAMILY_ROLE_OPTIONS: ReadonlyArray<{ value: FamilyRole; label: string }> = [
  { value: 'member', label: 'Miembro' },
  { value: 'admin', label: 'Administrador' },
];

export const isFamilyAdminRole = (role: string | undefined): boolean =>
  role?.toLowerCase() === 'admin';

export const familyRoleLabel = (role: string | undefined): string =>
  isFamilyAdminRole(role) ? 'Administrador' : 'Miembro';
