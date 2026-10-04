export interface FamilyMemberSummary {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'admin' | 'member' | string;
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
  role?: string;
}
