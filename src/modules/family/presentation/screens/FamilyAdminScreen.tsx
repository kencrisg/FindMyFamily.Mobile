import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../../auth/application/auth.store';
import { FamilyMembersManager } from '../components/FamilyMembersManager';
import { isFamilyAdminRole } from '../components/family-roles';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { makeStyles } from '../../../../shared/theme/use-theme';

/** Panel del administrador de una familia: gestiona a sus miembros. */
export const FamilyAdminScreen: React.FC = () => {
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('Administrar familia');

  // El backend es quien protege de verdad; esto evita mostrar un panel que fallaría en
  // cada acción, p. ej. si otro administrador le acaba de quitar el rol.
  const isAdminHere = useAuthStore(
    (state) =>
      state.user?.families?.some((f) => f.familyId === id && isFamilyAdminRole(f.familyRole)) ?? false
  );

  const handleLoaded = useCallback((name: string) => setTitle(name), []);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title }} />
      {id && isAdminHere ? (
        <FamilyMembersManager familyId={id} variant="family-admin" onFamilyLoaded={handleLoaded} />
      ) : (
        <EmptyState
          title="No administras esta familia"
          message="Solo los administradores de una familia pueden gestionar a sus miembros."
        />
      )}
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
}));
