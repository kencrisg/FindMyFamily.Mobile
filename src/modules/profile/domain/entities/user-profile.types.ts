export interface UserFamilyMembership {
  familyId: string;
  familyName: string;
  familyRole: 'admin' | 'member';
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  systemRole: 'admin' | 'user';
  role?: string;
  families: UserFamilyMembership[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpdatePhoneRequest {
  newPhoneNumber: string;
  /** Nombre exacto que espera `UpdatePhoneRequestDto` en el backend. */
  password: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
