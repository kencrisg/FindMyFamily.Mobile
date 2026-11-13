import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';
import {
  KeyRound,
  Link2,
  Pencil,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserMinus,
  UserPlus,
} from 'lucide-react-native';
import { useFamilyManagement } from '../../application/use-family-management';
import { FamilyMemberSummary } from '../../domain/entities/family.types';
import { useAuthStore } from '../../../auth/application/auth.store';
import { PersonFormModal } from './PersonFormModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { LinkMemberModal } from './LinkMemberModal';
import { familyRoleLabel, isFamilyAdminRole } from './family-roles';
import { ActionSheet, ActionSheetAction } from '../../../../shared/presentation/components/ActionSheet';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { ListRow, getInitials } from '../../../../shared/presentation/components/ListRow';
import { Section } from '../../../../shared/presentation/components/Section';
import { TextFieldModal } from '../../../../shared/presentation/components/TextFieldModal';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing } from '../../../../shared/theme/typography';

interface FamilyMembersManagerProps {
  familyId: string;
  /**
   * `family-admin`: un administrador gestionando su propia familia.
   * `platform-admin`: el super admin, que además puede renombrar o eliminar la familia y
   * vincular cuentas que ya existen.
   */
  variant: 'family-admin' | 'platform-admin';
  /** Se llama con el nombre en cuanto se carga, para ponerlo en la cabecera. */
  onFamilyLoaded?: (name: string) => void;
  /** Solo `platform-admin`: tras eliminar la familia, la pantalla debe cerrarse. */
  onFamilyDeleted?: () => void;
}

type OpenModal =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'link' }
  | { kind: 'rename' }
  | { kind: 'actions'; member: FamilyMemberSummary }
  | { kind: 'edit'; member: FamilyMemberSummary }
  | { kind: 'password'; member: FamilyMemberSummary };

const fullName = (m: FamilyMemberSummary) => `${m.firstName} ${m.lastName}`;

export const FamilyMembersManager: React.FC<FamilyMembersManagerProps> = ({
  familyId,
  variant,
  onFamilyLoaded,
  onFamilyDeleted,
}) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const management = useFamilyManagement(familyId);
  const { data: family, isLoading, isRefreshing, error, refresh, reload } = management;
  const [modal, setModal] = useState<OpenModal>({ kind: 'none' });
  const close = () => setModal({ kind: 'none' });
  const isPlatformAdmin = variant === 'platform-admin';

  useEffect(() => {
    if (family) onFamilyLoaded?.(family.name);
  }, [family, onFamilyLoaded]);

  if (!family) {
    return (
      <EmptyState
        loading={isLoading}
        title="Familia no disponible"
        error={error}
        onRetry={() => void reload()}
      />
    );
  }

  /** Errores de acciones sin formulario (cambiar rol, quitar): se muestran en un aviso. */
  const reportError = (message: string | null) => {
    if (message) Alert.alert('No se pudo completar', message);
  };

  const confirmRemove = (member: FamilyMemberSummary) => {
    Alert.alert(
      `¿Quitar a ${member.firstName} de ${family.name}?`,
      `Si ${member.firstName} no pertenece a ninguna otra familia, su cuenta se eliminará y ya no podrá entrar en la app. ` +
        (isPlatformAdmin
          ? 'Podrás restaurarla desde la papelera.'
          : 'Solo el administrador de la plataforma podría recuperarla.'),
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => reportError(await management.removeMember(member.userId)),
        },
      ]
    );
  };

  const confirmDeleteFamily = () => {
    if (family.members.length > 0) {
      Alert.alert(
        'La familia tiene miembros',
        'Para eliminarla, quita antes a todos sus miembros. Así cada uno recibe el trato correcto: se desvincula si está en otra familia, o se elimina su cuenta si era la única.'
      );
      return;
    }

    Alert.alert(`¿Eliminar ${family.name}?`, 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const deleteError = await management.deleteFamily();
          if (deleteError) {
            reportError(deleteError);
          } else {
            onFamilyDeleted?.();
          }
        },
      },
    ]);
  };

  const memberActions = (member: FamilyMemberSummary): ActionSheetAction[] => {
    const isAdmin = isFamilyAdminRole(member.role);
    return [
      {
        label: 'Editar datos',
        icon: <Pencil size={20} color={colors.textPrimary} />,
        onPress: () => setModal({ kind: 'edit', member }),
      },
      {
        label: 'Restablecer contraseña',
        icon: <KeyRound size={20} color={colors.textPrimary} />,
        onPress: () => setModal({ kind: 'password', member }),
      },
      isAdmin
        ? {
            label: 'Quitar como administrador',
            icon: <ShieldOff size={20} color={colors.textPrimary} />,
            onPress: async () => reportError(await management.changeRole(member.userId, 'member')),
          }
        : {
            label: 'Hacer administrador',
            icon: <ShieldCheck size={20} color={colors.textPrimary} />,
            onPress: async () => reportError(await management.changeRole(member.userId, 'admin')),
          },
      {
        label: 'Quitar de la familia',
        icon: <UserMinus size={20} color={colors.danger} />,
        destructive: true,
        onPress: () => confirmRemove(member),
      },
    ];
  };

  const sortedMembers = [...family.members].sort((a, b) => {
    // Administradores primero; dentro de cada grupo, por nombre.
    const byRole = Number(isFamilyAdminRole(b.role)) - Number(isFamilyAdminRole(a.role));
    return byRole !== 0 ? byRole : fullName(a).localeCompare(fullName(b));
  });

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
      >
        <Section
          title={`Miembros (${family.members.length})`}
          footer={
            isPlatformAdmin
              ? 'Toca a un miembro para editarlo, cambiar su rol o quitarlo.'
              : 'Toca a un familiar para editarlo, cambiar su rol o quitarlo. Tus propios datos se cambian desde Mi perfil.'
          }
        >
          {sortedMembers.length === 0 ? (
            <EmptyState title="Sin miembros" message="Esta familia aún no tiene a nadie." />
          ) : (
            sortedMembers.map((member, index) => {
              const isMe = member.userId === currentUserId;
              return (
                <ListRow
                  key={member.userId}
                  title={isMe ? `${fullName(member)} (tú)` : fullName(member)}
                  subtitle={member.phoneNumber}
                  initials={getInitials(member.firstName, member.lastName)}
                  trailing={
                    <Badge
                      label={familyRoleLabel(member.role)}
                      tone={isFamilyAdminRole(member.role) ? 'primary' : 'neutral'}
                    />
                  }
                  // Uno mismo no se gestiona desde aquí: se haría admin o se quitaría a sí
                  // mismo por accidente. Sus datos se cambian en Mi perfil.
                  onPress={isMe ? undefined : () => setModal({ kind: 'actions', member })}
                  isLast={index === sortedMembers.length - 1}
                />
              );
            })
          )}
        </Section>

        <Section title="Añadir">
          <ListRow
            title="Crear cuenta de familiar"
            subtitle="Para alguien que todavía no usa la app"
            icon={<UserPlus size={20} color={colors.primary} />}
            onPress={() => setModal({ kind: 'create' })}
            isLast={!isPlatformAdmin}
          />
          {isPlatformAdmin ? (
            <ListRow
              title="Vincular cuenta existente"
              subtitle="Para alguien que ya está en otra familia"
              icon={<Link2 size={20} color={colors.primary} />}
              onPress={() => setModal({ kind: 'link' })}
              isLast
            />
          ) : null}
        </Section>

        {isPlatformAdmin ? (
          <Section title="Familia">
            <ListRow
              title="Cambiar nombre"
              icon={<Pencil size={20} color={colors.textPrimary} />}
              onPress={() => setModal({ kind: 'rename' })}
            />
            <ListRow
              title="Eliminar familia"
              icon={<Trash2 size={20} color={colors.danger} />}
              onPress={confirmDeleteFamily}
              isLast
            />
          </Section>
        ) : null}
      </ScrollView>

      <ActionSheet
        visible={modal.kind === 'actions'}
        title={modal.kind === 'actions' ? fullName(modal.member) : ''}
        subtitle={modal.kind === 'actions' ? familyRoleLabel(modal.member.role) : undefined}
        actions={modal.kind === 'actions' ? memberActions(modal.member) : []}
        onClose={close}
      />

      <PersonFormModal
        visible={modal.kind === 'create'}
        mode="create"
        title="Crear cuenta de familiar"
        icon={<UserPlus size={24} color={colors.primary} />}
        description={`Se unirá a ${family.name} como miembro. Podrá entrar en la app con este teléfono y contraseña.`}
        submitLabel="Crear y añadir a la familia"
        onSubmit={({ firstName, lastName, phoneNumber, password }) =>
          management.createMember({ firstName, lastName, phoneNumber, password: password ?? '' })
        }
        onClose={close}
      />

      <PersonFormModal
        visible={modal.kind === 'edit'}
        mode="edit"
        title="Editar datos"
        icon={<Pencil size={24} color={colors.primary} />}
        description="Si cambias el teléfono, tendrá que usar el nuevo para iniciar sesión."
        submitLabel="Guardar cambios"
        initialValues={modal.kind === 'edit' ? modal.member : undefined}
        onSubmit={(values) =>
          modal.kind === 'edit'
            ? management.updateMember(modal.member.userId, values)
            : Promise.resolve(null)
        }
        onClose={close}
      />

      <ResetPasswordModal
        visible={modal.kind === 'password'}
        personName={modal.kind === 'password' ? modal.member.firstName : ''}
        onSubmit={async (newPassword) => {
          if (modal.kind !== 'password') return null;
          const resetError = await management.resetPassword(modal.member.userId, newPassword);
          if (!resetError) {
            Alert.alert(
              'Contraseña restablecida',
              `${modal.member.firstName} ya puede entrar con la nueva contraseña.`
            );
          }
          return resetError;
        }}
        onClose={close}
      />

      {isPlatformAdmin ? (
        <>
          <LinkMemberModal
            visible={modal.kind === 'link'}
            familyName={family.name}
            onSubmit={management.linkMember}
            onClose={close}
          />
          <TextFieldModal
            visible={modal.kind === 'rename'}
            title="Cambiar nombre de la familia"
            label="Nombre de la familia"
            initialValue={family.name}
            maxLength={100}
            submitLabel="Guardar"
            icon={<Pencil size={24} color={colors.primary} />}
            onSubmit={management.rename}
            onClose={close}
          />
        </>
      ) : null}
    </>
  );
};

const useStyles = makeStyles((colors) => ({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
}));
