import {
  UpdateMyProfileRequest,
  UpdatePasswordRequest,
  UpdatePhoneRequest,
  UserProfile,
} from '../entities/user-profile.types';

export interface IProfileRepository {
  getMyProfile(): Promise<UserProfile>;
  updateMyProfile(data: UpdateMyProfileRequest): Promise<UserProfile>;
  setLocationSharing(enabled: boolean): Promise<UserProfile>;
  updatePhone(data: UpdatePhoneRequest): Promise<UserProfile>;
  updatePassword(data: UpdatePasswordRequest): Promise<void>;
}
