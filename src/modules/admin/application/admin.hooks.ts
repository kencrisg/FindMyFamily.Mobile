import { useCallback } from 'react';
import { adminUsersRepository } from '../infrastructure/admin-users-api.repository';
import { familyRepository } from '../../family/infrastructure/family-api.repository';
import { Family } from '../../family/domain/entities/family.types';
import { UserProfile } from '../../profile/domain/entities/user-profile.types';
import { AdminCreateUserData, AdminUpdateUserData } from '../domain/entities/admin.types';
import { useResource } from '../../../shared/presentation/hooks/use-resource';
import { runMutation } from '../../../shared/presentation/utils/api-error';

/**
 * Hooks del panel de plataforma (solo super admin). Cada pantalla recarga su lista al
 * recuperar el foco, así que no hace falta un store global: tras crear o editar algo en
 * otra pantalla, al volver ya se ve actualizado.
 *
 * Las operaciones devuelven el mensaje de error del servidor, o null si salieron bien.
 */

export function useAdminFamilies() {
  const loader = useCallback(() => familyRepository.getMyFamilies(), []);
  const resource = useResource<Family[]>(loader, 'No se pudieron cargar las familias.');
  const { reload } = resource;

  const createFamily = useCallback(
    async (name: string) => {
      const error = await runMutation(
        () => familyRepository.createFamily({ name }),
        'No se pudo crear la familia.'
      );
      if (!error) await reload();
      return error;
    },
    [reload]
  );

  return { ...resource, createFamily };
}

export function useAdminUsers() {
  const loader = useCallback(() => adminUsersRepository.getUsers(), []);
  const resource = useResource<UserProfile[]>(loader, 'No se pudieron cargar los usuarios.');
  const { reload } = resource;

  const createUser = useCallback(
    async (data: AdminCreateUserData) => {
      const error = await runMutation(
        () => adminUsersRepository.createUser(data),
        'No se pudo crear el usuario.'
      );
      if (!error) await reload();
      return error;
    },
    [reload]
  );

  return { ...resource, createUser };
}

export function useAdminUser(userId: string) {
  const loader = useCallback(() => adminUsersRepository.getUser(userId), [userId]);
  const resource = useResource<UserProfile>(loader, 'No se pudo cargar el usuario.');
  const { reload } = resource;

  const updateUser = useCallback(
    async (data: AdminUpdateUserData) => {
      const error = await runMutation(
        () => adminUsersRepository.updateUser(userId, data),
        'No se pudieron guardar los cambios.'
      );
      if (!error) await reload();
      return error;
    },
    [userId, reload]
  );

  const resetPassword = useCallback(
    (newPassword: string) =>
      runMutation(
        () => adminUsersRepository.resetPassword(userId, newPassword),
        'No se pudo restablecer la contraseña.'
      ),
    [userId]
  );

  /** No recarga: la cuenta pasa a la papelera y la pantalla debe cerrarse. */
  const deleteUser = useCallback(
    () => runMutation(() => adminUsersRepository.deleteUser(userId), 'No se pudo eliminar la cuenta.'),
    [userId]
  );

  return { ...resource, updateUser, resetPassword, deleteUser };
}

export function useAdminDeletedUsers() {
  const loader = useCallback(() => adminUsersRepository.getDeletedUsers(), []);
  const resource = useResource<UserProfile[]>(loader, 'No se pudo cargar la papelera.');
  const { reload } = resource;

  const restoreUser = useCallback(
    async (userId: string) => {
      const error = await runMutation(
        () => adminUsersRepository.restoreUser(userId),
        'No se pudo restaurar la cuenta.'
      );
      if (!error) await reload();
      return error;
    },
    [reload]
  );

  return { ...resource, restoreUser };
}
