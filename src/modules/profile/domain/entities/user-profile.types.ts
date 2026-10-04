export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

export interface UpdatePhoneRequest {
  newPhoneNumber: string;
  passwordConfirmation: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
