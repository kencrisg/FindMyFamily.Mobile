import {
  AddFamilyMemberData,
  CreateFamilyData,
  CreateFamilyMemberUserData,
  Family,
  FamilyDetail,
  FamilyRole,
  UpdateFamilyMemberUserData,
} from '../entities/family.types';

export interface IFamilyRepository {
  /** Para el super admin devuelve todas las familias; para el resto, las suyas. */
  getMyFamilies(): Promise<Family[]>;
  getFamilyById(familyId: string): Promise<FamilyDetail>;

  // Solo super admin
  createFamily(data: CreateFamilyData): Promise<Family>;
  renameFamily(familyId: string, name: string): Promise<Family>;
  deleteFamily(familyId: string): Promise<void>;
  /** Vincula una cuenta que ya existe, buscándola por teléfono. */
  linkMember(familyId: string, data: AddFamilyMemberData): Promise<FamilyDetail>;

  // Admin de la familia o super admin
  createMemberUser(familyId: string, data: CreateFamilyMemberUserData): Promise<FamilyDetail>;
  updateMemberUser(familyId: string, userId: string, data: UpdateFamilyMemberUserData): Promise<FamilyDetail>;
  resetMemberPassword(familyId: string, userId: string, newPassword: string): Promise<void>;
  updateMemberRole(familyId: string, userId: string, role: FamilyRole): Promise<void>;
  removeMember(familyId: string, userId: string): Promise<void>;
}
