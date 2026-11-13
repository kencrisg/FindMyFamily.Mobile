import React, { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import { useAdminFamilies } from '../../application/admin.hooks';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { HeaderIconButton } from '../../../../shared/presentation/components/HeaderIconButton';
import { ListRow } from '../../../../shared/presentation/components/ListRow';
import { TextFieldModal } from '../../../../shared/presentation/components/TextFieldModal';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing } from '../../../../shared/theme/typography';

export const AdminFamiliesScreen: React.FC = () => {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { data: families, isLoading, isRefreshing, error, refresh, reload, createFamily } =
    useAdminFamilies();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Familias',
          headerRight: () => (
            <HeaderIconButton
              icon={<Plus size={24} color={colors.primary} />}
              accessibilityLabel="Crear familia"
              onPress={() => setIsCreating(true)}
            />
          ),
        }}
      />

      <FlatList
        data={families ?? []}
        keyExtractor={(family) => family.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        renderItem={({ item, index }) => (
          <View style={[styles.card, index === 0 && styles.first, index === (families?.length ?? 0) - 1 && styles.last]}>
            <ListRow
              title={item.name}
              subtitle={`${item.membersCount} ${item.membersCount === 1 ? 'miembro' : 'miembros'}`}
              icon={<Users size={20} color={colors.primary} />}
              onPress={() => router.push(`/families/${item.id}`)}
              isLast={index === (families?.length ?? 0) - 1}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            loading={isLoading}
            title="Aún no hay familias"
            message="Toca + para crear la primera. Después podrás añadirle miembros."
            error={error}
            onRetry={() => void reload()}
          />
        }
      />

      <TextFieldModal
        visible={isCreating}
        title="Nueva familia"
        label="Nombre de la familia"
        placeholder="Ej: Familia Castro"
        maxLength={100}
        submitLabel="Crear familia"
        icon={<Users size={24} color={colors.primary} />}
        onSubmit={createFamily}
        onClose={() => setIsCreating(false)}
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
