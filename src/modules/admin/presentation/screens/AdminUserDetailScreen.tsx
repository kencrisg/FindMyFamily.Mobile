import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { KeyRound, Pencil, Trash2, Users } from 'lucide-react-native';
import { useAdminUser } from '../../application/admin.hooks';
import { PersonFormModal } from '../../../family/presentation/components/PersonFormModal';
import { ResetPasswordModal } from '../../../family/presentation/components/ResetPasswordModal';
import { familyRoleLabel, isFamilyAdminRole } from '../../../family/presentation/components/family-roles';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { ListRow, getInitials } from '../../../../shared/presentation/components/ListRow';
import { Section } from '../../../../shared/presentation/components/Section';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing, Typography } from '../../../../shared/theme/typography';

type OpenModal = 'none' | 'edit' | 'password';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });

export const AdminUserDetailScreen: React.FC = () => {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, isLoading, isRefreshing, error, refresh, reload, updateUser, resetPassword, deleteUser } =
    useAdminUser(id ?? '');
  const [modal, setModal] = useState<OpenModal>('none');
  const close = () => setModal('none');

  if (!user) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ title: 'Usuario' }} />
        <EmptyState loading={isLoading} title="Usuario no disponible" error={error} onRetry={() => void reload()} />
      </View>
    );
  }

  const isPlatformAdmin = user.systemRole === 'admin';
  const name = `${user.firstName} ${user.lastName}`;

  const confirmDelete = () => {
    const familyNote =
      user.families.length > 0
        ? `Saldrá de ${user.families.length === 1 ? 'su familia' : `sus ${user.families.length} familias`} y `
        : '';
    Alert.alert(
      `¿Eliminar la cuenta de ${user.firstName}?`,
      `${familyNote}ya no podrá entrar en la app. La cuenta irá a la papelera, desde donde podrás restaurarla.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const deleteError = await deleteUser();
            if (deleteError) {
              Alert.alert('No se pudo eliminar', deleteError);
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: user.firstName }} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.firstName, user.lastName)}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{user.phoneNumber}</Text>
          <Text style={styles.meta}>Desde el {formatDate(user.createdAt)}</Text>
          {isPlatformAdmin ? (
            <View style={styles.badge}>
              <Badge label="Administrador de la plataforma" tone="warning" />
            </View>
          ) : null}
        </View>

        {isPlatformAdmin ? (
          <Section footer="Es tu cuenta de administrador. Tus datos y tu contraseña se cambian desde la pestaña Cuenta.">
            <ListRow title="Sin familias" subtitle="El administrador de la plataforma no pertenece a ninguna familia." isLast />
          </Section>
        ) : (
          <>
            <Section
              title="Familias"
              footer={
                user.families.length === 0
                  ? 'Para añadirle a una familia, ábrela y usa «Vincular cuenta existente».'
                  : undefined
              }
            >
              {user.families.length === 0 ? (
                <ListRow title="Sin familia" subtitle="No puede ver ni ser visto por nadie." isLast />
              ) : (
                user.families.map((membership, index) => (
                  <ListRow
                    key={membership.familyId}
                    title={membership.familyName}
                    icon={<Users size={20} color={colors.primary} />}
                    trailing={
                      <Badge
                        label={familyRoleLabel(membership.familyRole)}
                        tone={isFamilyAdminRole(membership.familyRole) ? 'primary' : 'neutral'}
                      />
                    }
                    onPress={() => router.push(`/families/${membership.familyId}`)}
                    isLast={index === user.families.length - 1}
                  />
                ))
              )}
            </Section>

            <Section title="Cuenta">
              <ListRow
                title="Editar datos"
                icon={<Pencil size={20} color={colors.primary} />}
                onPress={() => setModal('edit')}
              />
              <ListRow
                title="Restablecer contraseña"
                icon={<KeyRound size={20} color={colors.primary} />}
                onPress={() => setModal('password')}
              />
              <ListRow
                title="Eliminar cuenta"
                icon={<Trash2 size={20} color={colors.danger} />}
                onPress={confirmDelete}
                isLast
              />
            </Section>
          </>
        )}
      </ScrollView>

      <PersonFormModal
        visible={modal === 'edit'}
        mode="edit"
        title="Editar datos"
        icon={<Pencil size={24} color={colors.primary} />}
        description="Si cambias el teléfono, tendrá que usar el nuevo para iniciar sesión."
        submitLabel="Guardar cambios"
        initialValues={user}
        onSubmit={updateUser}
        onClose={close}
      />

      <ResetPasswordModal
        visible={modal === 'password'}
        personName={user.firstName}
        onSubmit={async (newPassword) => {
          const resetError = await resetPassword(newPassword);
          if (!resetError) {
            Alert.alert('Contraseña restablecida', `${user.firstName} ya puede entrar con la nueva contraseña.`);
          }
          return resetError;
        }}
        onClose={close}
      />
    </View>
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
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.title2,
    color: colors.primary,
  },
  name: {
    ...Typography.title2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  meta: {
    ...Typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    marginTop: Spacing.sm,
  },
}));
