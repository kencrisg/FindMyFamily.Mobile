import React from 'react';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { useAdminDeletedUsers } from '../../application/admin.hooks';
import { UserProfile } from '../../../profile/domain/entities/user-profile.types';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { ListRow, getInitials } from '../../../../shared/presentation/components/ListRow';
import { makeStyles } from '../../../../shared/theme/use-theme';
import { Spacing, Typography } from '../../../../shared/theme/typography';

/** Papelera: cuentas borradas lógicamente, que se pueden restaurar. */
export const AdminDeletedUsersScreen: React.FC = () => {
  const styles = useStyles();
  const { data: users, isLoading, isRefreshing, error, refresh, reload, restoreUser } =
    useAdminDeletedUsers();

  const confirmRestore = (user: UserProfile) => {
    Alert.alert(
      `¿Restaurar a ${user.firstName}?`,
      'Podrá volver a entrar con su contraseña de siempre. La cuenta vuelve sin familia: después añádela a una desde la familia, con «Vincular cuenta existente».',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: async () => {
            const restoreError = await restoreUser(user.id);
            if (restoreError) Alert.alert('No se pudo restaurar', restoreError);
          },
        },
      ]
    );
  };

  const count = users?.length ?? 0;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Papelera' }} />
      <FlatList
        data={users ?? []}
        keyExtractor={(user) => user.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          count > 0 ? (
            <Text style={styles.intro}>
              Cuentas eliminadas. No pueden entrar en la app ni aparecen en ninguna familia, pero
              su teléfono sigue reservado.
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View style={[styles.card, index === 0 && styles.first, index === count - 1 && styles.last]}>
            <ListRow
              title={`${item.firstName} ${item.lastName}`}
              subtitle={item.phoneNumber}
              initials={getInitials(item.firstName, item.lastName)}
              trailing={
                <TouchableOpacity
                  onPress={() => confirmRestore(item)}
                  style={styles.restore}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Restaurar a ${item.firstName}`}
                >
                  <Text style={styles.restoreText}>Restaurar</Text>
                </TouchableOpacity>
              }
              isLast={index === count - 1}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            loading={isLoading}
            title="La papelera está vacía"
            message="Aquí aparecen las cuentas eliminadas, por si hay que recuperarlas."
            error={error}
            onRetry={() => void reload()}
          />
        }
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
  intro: {
    ...Typography.footnote,
    color: colors.textSecondary,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.sm,
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
  restore: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadiusPill,
    backgroundColor: colors.primaryMuted,
  },
  restoreText: {
    ...Typography.subhead,
    color: colors.primary,
    fontWeight: '700',
  },
}));
