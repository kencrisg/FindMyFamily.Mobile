import {
  UpdatePasswordRequest,
  UpdatePhoneRequest,
  UserProfile,
} from '../entities/user-profile.types';

export interface IProfileRepository {
  getMyProfile(): Promise<UserProfile>;
  updatePhone(data: UpdatePhoneRequest): Promise<UserProfile>;
  updatePassword(data: UpdatePasswordRequest): Promise<void>;
}
