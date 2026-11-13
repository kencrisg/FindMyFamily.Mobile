import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FamilyMembersManager } from '../../../family/presentation/components/FamilyMembersManager';
import { makeStyles } from '../../../../shared/theme/use-theme';

export const AdminFamilyDetailScreen: React.FC = () => {
  const styles = useStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('Familia');

  const handleLoaded = useCallback((name: string) => setTitle(name), []);
  const handleDeleted = useCallback(() => router.back(), [router]);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title }} />
      {id ? (
        <FamilyMembersManager
          familyId={id}
          variant="platform-admin"
          onFamilyLoaded={handleLoaded}
          onFamilyDeleted={handleDeleted}
        />
      ) : null}
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
}));
