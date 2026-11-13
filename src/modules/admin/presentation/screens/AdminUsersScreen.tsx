import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Archive, Search, UserPlus } from 'lucide-react-native';
import { useAdminFamilies, useAdminUsers } from '../../application/admin.hooks';
import { FamilyPicker } from '../components/FamilyPicker';
import { PersonFormModal } from '../../../family/presentation/components/PersonFormModal';
import { FAMILY_ROLE_OPTIONS } from '../../../family/presentation/components/family-roles';
import { FamilyRole } from '../../../family/domain/entities/family.types';
import { UserProfile } from '../../../profile/domain/entities/user-profile.types';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { HeaderIconButton } from '../../../../shared/presentation/components/HeaderIconButton';
import { ListRow, getInitials } from '../../../../shared/presentation/components/ListRow';
import { SegmentedControl } from '../../../../shared/presentation/components/SegmentedControl';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing, Typography } from '../../../../shared/theme/typography';

const isPlatformAdmin = (user: UserProfile) => user.systemRole === 'admin';

/** "Familia Castro (admin) · Familia Pérez", o "Sin familia". */
const describeFamilies = (user: UserProfile): string => {
  if (isPlatformAdmin(user)) return 'Administra la plataforma';
  if (user.families.length === 0) return 'Sin familia';
  return user.families
    .map((f) => (f.familyRole === 'admin' ? `${f.familyName} (admin)` : f.familyName))
    .join(' · ');
};

export const AdminUsersScreen: React.FC = () => {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { data: users, isLoading, isRefreshing, error, refresh, reload, createUser } = useAdminUsers();
  const { data: families } = useAdminFamilies();
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyRole, setFamilyRole] = useState<FamilyRole>('member');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const sorted = [...(users ?? [])].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    );
    if (!term) return sorted;
    return sorted.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) || u.phoneNumber.includes(term)
    );
  }, [users, query]);

  const openCreate = () => {
    setFamilyId(families?.length === 1 ? families[0].id : null);
    setFamilyRole('member');
    setIsCreating(true);
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Usuarios',
          headerRight: () => (
            <View style={styles.headerActions}>
              <HeaderIconButton
                icon={<Archive size={22} color={colors.primary} />}
                accessibilityLabel="Papelera de cuentas eliminadas"
                onPress={() => router.push('/users/deleted')}
              />
              <HeaderIconButton
                icon={<UserPlus size={22} color={colors.primary} />}
                accessibilityLabel="Crear usuario"
                onPress={openCreate}
              />
            </View>
          ),
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(user) => user.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={styles.search}>
            <Search size={18} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o teléfono"
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.card,
              index === 0 && styles.first,
              index === filtered.length - 1 && styles.last,
            ]}
          >
            <ListRow
              title={`${item.firstName} ${item.lastName}`}
              subtitle={`${item.phoneNumber}\n${describeFamilies(item)}`}
              initials={getInitials(item.firstName, item.lastName)}
              trailing={isPlatformAdmin(item) ? <Badge label="Super admin" tone="warning" /> : undefined}
              onPress={() => router.push(`/users/${item.id}`)}
              isLast={index === filtered.length - 1}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            loading={isLoading}
            title={query ? 'Sin resultados' : 'Aún no hay usuarios'}
            message={query ? `Nadie coincide con «${query}».` : 'Toca el icono de añadir para crear el primero.'}
            error={error}
            onRetry={() => void reload()}
          />
        }
      />

      <PersonFormModal
        visible={isCreating}
        mode="create"
        title="Nuevo usuario"
        icon={<UserPlus size={24} color={colors.primary} />}
        description="Todo usuario pertenece al menos a una familia. Podrá entrar en la app con este teléfono y contraseña."
        submitLabel="Crear usuario"
        onSubmit={(values) => {
          if (!familyId) return Promise.resolve('Elige la familia del nuevo usuario.');
          return createUser({
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: values.phoneNumber,
            password: values.password ?? '',
            familyId,
            familyRole,
          });
        }}
        onClose={() => setIsCreating(false)}
      >
        <FamilyPicker families={families} selectedId={familyId} onSelect={setFamilyId} />
        <SegmentedControl
          label="Rol en la familia"
          options={FAMILY_ROLE_OPTIONS}
          value={familyRole}
          onChange={setFamilyRole}
        />
      </PersonFormModal>
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: Spacing.borderRadiusSm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    ...Typography.body,
    flex: 1,
    paddingVertical: Spacing.md,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.cardBackground,
    overflow: 'hidden',
  },
  first: {
    borderTopLeftRadius: Spacing.borderRadiusMd,
    borderTopRightRadius: Spacing.borderRadiusMd,
  },
  last: {
    borderBottomLeftRadius: Spacing.borderRadiusMd,
    borderBottomRightRadius: Spacing.borderRadiusMd,
  },
}));
