import React, { useCallback, useState } from 'react';
import { Alert, Linking, ScrollView, Switch } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { MapPin, Shield, Smartphone } from 'lucide-react-native';
import { selectIsSuperAdmin, useAuthStore } from '../../../auth/application/auth.store';
import { useProfileActions } from '../../../profile/application/use-profile-actions';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { ListRow } from '../../../../shared/presentation/components/ListRow';
import { Section } from '../../../../shared/presentation/components/Section';
import { SegmentedControl } from '../../../../shared/presentation/components/SegmentedControl';
import { ThemePreference, useThemeStore } from '../../../../shared/theme/theme.store';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing } from '../../../../shared/theme/typography';

const APPEARANCE_OPTIONS: ReadonlyArray<{ value: ThemePreference; label: string }> = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Predeterminado' },
];

/**
 * Estado real del permiso de ubicación. Antes la pantalla decía siempre "Activo", aunque el
 * usuario hubiera quitado el permiso: justo el caso en que su familia no podría encontrarle.
 */
type SharingStatus = 'checking' | 'active' | 'foreground-only' | 'off';

const PERMISSION_BADGE: Record<
  Exclude<SharingStatus, 'checking' | 'active'>,
  { label: string; tone: 'warning' | 'danger'; subtitle: string }
> = {
  'foreground-only': {
    label: 'Limitado',
    tone: 'warning',
    subtitle: 'Solo funciona con la app abierta. Toca para permitirlo siempre',
  },
  off: {
    label: 'Desactivado',
    tone: 'danger',
    subtitle: 'El teléfono no deja usar el GPS. Toca para permitirlo',
  },
};

async function readSharingStatus(): Promise<Exclude<SharingStatus, 'checking'>> {
  try {
    const background = await Location.getBackgroundPermissionsAsync();
    if (background.status === 'granted') return 'active';
    const foreground = await Location.getForegroundPermissionsAsync();
    return foreground.status === 'granted' ? 'foreground-only' : 'off';
  } catch {
    return 'off';
  }
}

/** Configuración de la app: apariencia y, para los familiares, el estado de este teléfono. */
export const AppSettingsScreen: React.FC = () => {
  const styles = useStyles();
  const { colors } = useTheme();
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  // El super admin no comparte ubicación con nadie: esa sección no le aplica.
  const isSuperAdmin = useAuthStore(selectIsSuperAdmin);
  const [sharing, setSharing] = useState<SharingStatus>('checking');

  // Decisión del usuario de compartir (o no) su ubicación con la familia. Es distinta del
  // permiso del teléfono: se puede tener el permiso y aun así no querer compartirla.
  const sharingEnabled = useAuthStore((state) => state.user?.locationSharingEnabled ?? true);
  const { setLocationSharing } = useProfileActions();
  const [savingSharing, setSavingSharing] = useState(false);

  const applySharing = async (enabled: boolean) => {
    setSavingSharing(true);
    const error = await setLocationSharing(enabled);
    setSavingSharing(false);
    if (error) Alert.alert('No se pudo guardar', error);
  };

  const handleSharingChange = (enabled: boolean) => {
    if (enabled) {
      void applySharing(true);
      return;
    }
    // Desactivarlo tiene consecuencias para la familia: se confirma, para que no se
    // quede desactivado por un toque sin querer.
    Alert.alert(
      '¿Dejar de compartir tu ubicación?',
      'Tu familia no podrá pedir tu ubicación ni ver la última que se guardó. Si lo intentan, verán que tienes esta opción desactivada. Puedes volver a activarla cuando quieras.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Dejar de compartir', style: 'destructive', onPress: () => void applySharing(false) },
      ]
    );
  };

  // Se vuelve a comprobar al regresar a la pantalla: lo normal es ir a los ajustes del
  // teléfono a dar el permiso y volver.
  useFocusEffect(
    useCallback(() => {
      if (isSuperAdmin) return;
      let cancelled = false;
      void readSharingStatus().then((status) => {
        if (!cancelled) setSharing(status);
      });
      return () => {
        cancelled = true;
      };
    }, [isSuperAdmin])
  );

  // El aviso del permiso solo tiene sentido si el usuario quiere compartir y le falta algo.
  const permissionIssue =
    sharingEnabled && (sharing === 'foreground-only' || sharing === 'off') ? PERMISSION_BADGE[sharing] : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Section title="Apariencia" footer="Predeterminado usa el mismo modo que tu teléfono.">
        <SegmentedControl
          options={APPEARANCE_OPTIONS}
          value={preference}
          onChange={(value) => void setPreference(value)}
          style={styles.segmented}
        />
      </Section>

      {!isSuperAdmin ? (
        <Section title="Este dispositivo">
          <ListRow
            title="Compartir mi ubicación"
            subtitle={
              sharingEnabled
                ? 'Tu familia puede ver dónde estás cuando lo pide'
                : 'Desactivado: tu familia no puede ver dónde estás'
            }
            icon={<Smartphone size={20} color={sharingEnabled ? colors.primary : colors.textTertiary} />}
            trailing={
              <Switch
                value={sharingEnabled}
                onValueChange={handleSharingChange}
                disabled={savingSharing}
                trackColor={{ true: colors.secondary, false: colors.surfaceMuted }}
                thumbColor={colors.textInverse}
                accessibilityLabel="Compartir mi ubicación"
              />
            }
          />
          {permissionIssue ? (
            <ListRow
              title="Permiso de ubicación"
              subtitle={permissionIssue.subtitle}
              icon={<MapPin size={20} color={colors.warning} />}
              trailing={<Badge label={permissionIssue.label} tone={permissionIssue.tone} />}
              onPress={() => void Linking.openSettings()}
            />
          ) : null}
          <ListRow
            title="Privacidad"
            subtitle="El GPS solo se enciende cuando tu familia pide tu ubicación"
            icon={<Shield size={20} color={colors.secondary} />}
            isLast
          />
        </Section>
      ) : null}
    </ScrollView>
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
  segmented: {
    margin: Spacing.md,
    marginBottom: Spacing.md,
  },
}));
