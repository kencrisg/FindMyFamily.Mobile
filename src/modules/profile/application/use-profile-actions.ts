import { useCallback } from 'react';
import { profileRepository } from '../infrastructure/profile-api.repository';
import { useAuthStore } from '../../auth/application/auth.store';
import { runMutation } from '../../../shared/presentation/utils/api-error';

export type PasswordChangeResult =
  | { ok: true; sessionRenewed: boolean }
  | { ok: false; error: string };

/**
 * Cambios sobre la propia cuenta. Tras cada uno se recarga el perfil, para que el nombre
 * y el teléfono nuevos se vean en toda la app sin volver a entrar.
 */
export function useProfileActions() {
  const reloadProfile = useAuthStore((state) => state.reloadProfile);
  const renewSession = useAuthStore((state) => state.renewSession);

  const updateName = useCallback(
    async (firstName: string, lastName: string) => {
      const error = await runMutation(
        () => profileRepository.updateMyProfile({ firstName, lastName }),
        'No se pudo guardar tu nombre.'
      );
      if (!error) await reloadProfile().catch(() => undefined);
      return error;
    },
    [reloadProfile]
  );

  const updatePhone = useCallback(
    async (newPhoneNumber: string, password: string) => {
      const error = await runMutation(
        () => profileRepository.updatePhone({ newPhoneNumber, password }),
        'No se pudo cambiar tu teléfono.'
      );
      if (!error) await reloadProfile().catch(() => undefined);
      return error;
    },
    [reloadProfile]
  );

  /**
   * El backend cierra TODAS las sesiones al cambiar la contraseña, también la de este
   * teléfono. Para no echar al usuario, se abre una sesión nueva con la contraseña recién
   * puesta. Si eso falla, quien llama debe pedirle que vuelva a entrar.
   */
  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<PasswordChangeResult> => {
      const error = await runMutation(
        () => profileRepository.updatePassword({ currentPassword, newPassword }),
        'No se pudo cambiar tu contraseña.'
      );
      if (error) return { ok: false, error };

      const sessionRenewed = await renewSession(newPassword);
      return { ok: true, sessionRenewed };
    },
    [renewSession]
  );

  const setLocationSharing = useCallback(
    async (enabled: boolean) => {
      const error = await runMutation(
        () => profileRepository.setLocationSharing(enabled),
        'No se pudo cambiar la opción de compartir tu ubicación.'
      );
      if (!error) await reloadProfile().catch(() => undefined);
      return error;
    },
    [reloadProfile]
  );

  return { updateName, updatePhone, updatePassword, setLocationSharing };
}
