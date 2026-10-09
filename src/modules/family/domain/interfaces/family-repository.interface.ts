import {
  AddFamilyMemberData,
  CreateFamilyData,
  CreateFamilyMemberUserData,
  Family,
  FamilyDetail,
} from '../entities/family.types';

export interface IFamilyRepository {
  getMyFamilies(): Promise<Family[]>;
  getFamilyById(familyId: string): Promise<FamilyDetail>;
  createFamily(data: CreateFamilyData): Promise<Family>;
  addMember(familyId: string, data: AddFamilyMemberData): Promise<FamilyDetail>;
  createMemberUser(familyId: string, data: CreateFamilyMemberUserData): Promise<FamilyDetail>;
  removeMember(familyId: string, userId: string): Promise<void>;
  updateMemberRole(familyId: string, userId: string, role: string): Promise<void>;
}
