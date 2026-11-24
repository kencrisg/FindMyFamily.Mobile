import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Info, KeyRound, LogOut, Phone, SlidersHorizontal, User, Users } from 'lucide-react-native';
import { selectIsSuperAdmin, useAuthStore } from '../../../auth/application/auth.store';
import { useProfileActions } from '../../application/use-profile-actions';
import { ChangePasswordModal, ChangePhoneModal, EditNameModal } from '../components/ProfileForms';
import { familyRoleLabel, isFamilyAdminRole } from '../../../family/presentation/components/family-roles';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { ListRow, getInitials } from '../../../../shared/presentation/components/ListRow';
import { Section } from '../../../../shared/presentation/components/Section';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing, Typography } from '../../../../shared/theme/typography';

type OpenModal = 'none' | 'name' | 'phone' | 'password';

/**
 * Mi perfil: datos personales, teléfono, contraseña y cierre de sesión. Lo usan los
 * familiares y el super admin; las familias solo se muestran a los familiares, porque el
 * super admin no pertenece a ninguna.
 */
export const ProfileScreen: React.FC = () => {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = useAuthStore(selectIsSuperAdmin);
  const logout = useAuthStore((state) => state.logout);
  const { updateName, updatePhone, updatePassword } = useProfileActions();
  const [modal, setModal] = useState<OpenModal>('none');
  const close = () => setModal('none');

  if (!user) return null;

  const families = user.families ?? [];

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      // Sin navegación manual: Stack.Protected lleva al login al cambiar la sesión.
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  };

  const handlePasswordChange = async (current: string, next: string) => {
    const result = await updatePassword(current, next);
    if (!result.ok) return result.error;

    if (result.sessionRenewed) {
      Alert.alert('Contraseña cambiada', 'Tu contraseña se actualizó correctamente.');
    } else {
      // La contraseña sí cambió, pero no se pudo abrir la sesión nueva (p. ej. sin red).
      // Mejor pedir que vuelva a entrar ahora que expulsarle por sorpresa más tarde.
      Alert.alert(
        'Contraseña cambiada',
        'Tu contraseña se actualizó. Por seguridad, vuelve a iniciar sesión con la nueva.',
        [{ text: 'Entendido', onPress: logout }]
      );
    }
    return null;
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.firstName, user.lastName)}</Text>
          </View>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.phone}>{user.phoneNumber}</Text>
          {isSuperAdmin ? (
            <View style={styles.roleBadge}>
              <Badge label="Administrador de la plataforma" tone="warning" />
            </View>
          ) : null}
        </View>

        <Section title="Mis datos">
          <ListRow
            title="Nombre"
            subtitle={`${user.firstName} ${user.lastName}`}
            icon={<User size={20} color={colors.primary} />}
            onPress={() => setModal('name')}
          />
          <ListRow
            title="Teléfono"
            subtitle={user.phoneNumber}
            icon={<Phone size={20} color={colors.primary} />}
            onPress={() => setModal('phone')}
          />
          <ListRow
            title="Contraseña"
            subtitle="Cámbiala cuando quieras"
            icon={<KeyRound size={20} color={colors.primary} />}
            onPress={() => setModal('password')}
            isLast
          />
        </Section>

        {!isSuperAdmin && families.length > 0 ? (
          <Section
            title="Mis familias"
            footer={
              families.some((f) => isFamilyAdminRole(f.familyRole))
                ? 'Toca una familia que administras para gestionar a sus miembros.'
                : undefined
            }
          >
            {families.map((membership, index) => {
              const isAdmin = isFamilyAdminRole(membership.familyRole);
              return (
                <ListRow
                  key={membership.familyId}
                  title={membership.familyName}
                  icon={<Users size={20} color={colors.primary} />}
                  trailing={
                    <Badge label={familyRoleLabel(membership.familyRole)} tone={isAdmin ? 'primary' : 'neutral'} />
                  }
                  onPress={isAdmin ? () => router.push(`/family/${membership.familyId}`) : undefined}
                  isLast={index === families.length - 1}
                />
              );
            })}
          </Section>
        ) : null}

        {/* Los familiares llegan a la configuración desde la pestaña "Yo" del mapa; el super
            admin no tiene mapa, así que su acceso está aquí. */}
        {isSuperAdmin ? (
          <Section>
            <ListRow
              title="Configuración de la app"
              subtitle="Modo oscuro"
              icon={<SlidersHorizontal size={20} color={colors.primary} />}
              onPress={() => router.push('/account/settings')}
            />
            <ListRow
              title="Acerca de"
              subtitle="Código abierto, autor y licencias"
              icon={<Info size={20} color={colors.primary} />}
              onPress={() => router.push('/account/about')}
              isLast
            />
          </Section>
        ) : null}

        <Section>
          <ListRow
            title="Cerrar sesión"
            icon={<LogOut size={20} color={colors.danger} />}
            onPress={confirmLogout}
            isLast
          />
        </Section>
      </ScrollView>

      <EditNameModal
        visible={modal === 'name'}
        firstName={user.firstName}
        lastName={user.lastName}
        onSubmit={updateName}
        onClose={close}
      />
      <ChangePhoneModal visible={modal === 'phone'} onSubmit={updatePhone} onClose={close} />
      <ChangePasswordModal visible={modal === 'password'} onSubmit={handlePasswordChange} onClose={close} />
    </>
  );
};

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.title1,
    color: colors.textInverse,
  },
  name: {
    ...Typography.title2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  phone: {
    ...Typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: Spacing.sm,
  },
}));
