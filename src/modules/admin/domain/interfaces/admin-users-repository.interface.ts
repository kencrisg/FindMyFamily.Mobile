import { UserProfile } from '../../../profile/domain/entities/user-profile.types';
import { AdminCreateUserData, AdminUpdateUserData } from '../entities/admin.types';

/** Gestión de cuentas de la plataforma. Todos los métodos exigen ser super admin. */
export interface IAdminUsersRepository {
  getUsers(): Promise<UserProfile[]>;
  getUser(userId: string): Promise<UserProfile>;
  createUser(data: AdminCreateUserData): Promise<UserProfile>;
  updateUser(userId: string, data: AdminUpdateUserData): Promise<UserProfile>;
  resetPassword(userId: string, newPassword: string): Promise<void>;
  /** Borrado lógico: la cuenta pasa a la papelera y puede restaurarse. */
  deleteUser(userId: string): Promise<void>;
  getDeletedUsers(): Promise<UserProfile[]>;
  restoreUser(userId: string): Promise<UserProfile>;
}
