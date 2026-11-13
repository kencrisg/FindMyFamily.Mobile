import { useCallback } from 'react';
import { familyRepository } from '../infrastructure/family-api.repository';
import {
  CreateFamilyMemberUserData,
  FamilyDetail,
  FamilyRole,
  UpdateFamilyMemberUserData,
} from '../domain/entities/family.types';
import { useFamilyStore } from './family.store';
import { useAuthStore } from '../../auth/application/auth.store';
import { useResource } from '../../../shared/presentation/hooks/use-resource';
import { runMutation } from '../../../shared/presentation/utils/api-error';

/**
 * Gestión de los miembros de una familia. La comparten el panel del admin familiar y el
 * del super admin: los permisos los decide el backend, y la pantalla solo oculta lo que
 * cada uno no puede hacer.
 *
 * Cada operación devuelve el mensaje de error del servidor, o null si salió bien.
 */
export function useFamilyManagement(familyId: string) {
  const loader = useCallback(() => familyRepository.getFamilyById(familyId), [familyId]);
  const resource = useResource<FamilyDetail>(loader, 'No se pudo cargar la familia.');
  const { reload } = resource;

  /**
   * Tras cada cambio se recarga el detalle, y también lo que otras partes de la app tienen
   * en memoria: la lista de miembros del mapa, si es esta familia, y el propio perfil, si
   * el cambio afecta al usuario que está usando la app (p. ej. se quitó el rol de admin).
   */
  const afterChange = useCallback(
    async (affectedUserId?: string) => {
      await reload();

      const familyStore = useFamilyStore.getState();
      if (familyStore.activeFamily?.id === familyId) {
        void familyStore.selectFamily(familyId);
      }

      const auth = useAuthStore.getState();
      if (affectedUserId && affectedUserId === auth.user?.id) {
        await auth.reloadProfile().catch(() => undefined);
      }
    },
    [familyId, reload]
  );

  const mutate = useCallback(
    async (action: () => Promise<unknown>, fallback: string, affectedUserId?: string) => {
      const error = await runMutation(action, fallback);
      if (!error) await afterChange(affectedUserId);
      return error;
    },
    [afterChange]
  );

  return {
    ...resource,

    createMember: (data: CreateFamilyMemberUserData) =>
      mutate(
        () => familyRepository.createMemberUser(familyId, data),
        'No se pudo crear la cuenta del familiar.'
      ),

    linkMember: (phoneNumber: string, role: FamilyRole) =>
      mutate(
        () => familyRepository.linkMember(familyId, { phoneNumber, role }),
        'No se pudo vincular al usuario.'
      ),

    updateMember: (userId: string, data: UpdateFamilyMemberUserData) =>
      mutate(
        () => familyRepository.updateMemberUser(familyId, userId, data),
        'No se pudieron guardar los cambios.',
        userId
      ),

    resetPassword: (userId: string, newPassword: string) =>
      mutate(
        () => familyRepository.resetMemberPassword(familyId, userId, newPassword),
        'No se pudo restablecer la contraseña.'
      ),

    changeRole: (userId: string, role: FamilyRole) =>
      mutate(
        () => familyRepository.updateMemberRole(familyId, userId, role),
        'No se pudo cambiar el rol.',
        userId
      ),

    removeMember: (userId: string) =>
      mutate(
        () => familyRepository.removeMember(familyId, userId),
        'No se pudo quitar al miembro.',
        userId
      ),

    rename: (name: string) =>
      mutate(() => familyRepository.renameFamily(familyId, name), 'No se pudo renombrar la familia.'),

    /** No recarga: la familia deja de existir y la pantalla debe cerrarse. */
    deleteFamily: () =>
      runMutation(() => familyRepository.deleteFamily(familyId), 'No se pudo eliminar la familia.'),
  };
}
