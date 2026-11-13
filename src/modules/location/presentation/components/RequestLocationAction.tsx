import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { Radio, ChevronLeft, AlertCircle, MapPin } from 'lucide-react-native';
import { FamilyMemberSummary } from '../../../family/domain/entities/family.types';
import { LocationCoordinate } from '../../domain/entities/location.types';
import { MemberRequestState } from '../../application/location.store';
import { BigButton } from '../../../../shared/presentation/components/BigButton';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Typography, Spacing } from '../../../../shared/theme/typography';
import { usePlaceName } from '../hooks/use-place-name';
import { describeMemberLocation, useNow, StatusTone } from '../utils/member-location-status';

interface RequestLocationActionProps {
  member: FamilyMemberSummary;
  familyId: string;
  location?: LocationCoordinate | null;
  requestState: MemberRequestState;
  error: string | null;
  onRequestLocation: () => void;
  onDeselect: () => void;
}

export const RequestLocationAction: React.FC<RequestLocationActionProps> = ({
  member,
  location,
  requestState,
  error,
  onRequestLocation,
  onDeselect,
}) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const esperando = requestState.status === 'waiting';
  const now = useNow();
  const place = usePlaceName(location);
  const status = describeMemberLocation(location, requestState, now);

  const toneColor: Record<StatusTone, string> = {
    live: colors.secondary,
    warning: colors.warning,
    active: colors.primary,
    muted: colors.textSecondary,
  };

  // El botón atrás de Android vuelve a la lista de familiares, igual que el enlace de arriba.
  // Sin esto, pulsarlo en esta vista no regresaba a la lista.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onDeselect();
      return true;
    });
    return () => subscription.remove();
  }, [onDeselect]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onDeselect}
        style={styles.backBtn}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="Volver a la lista de familiares"
        hitSlop={8}
      >
        <ChevronLeft size={22} color={colors.primary} />
        <Text style={styles.backText}>Familiares</Text>
      </TouchableOpacity>

      {/* Al estilo de "Buscar" del iPhone: nombre, sitio en una línea y estado. */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {member.firstName} {member.lastName}
        </Text>
        {location && requestState.status !== 'sharing-disabled' ? (
          <View style={styles.placeRow}>
            <MapPin size={15} color={colors.textSecondary} />
            <Text style={styles.place} numberOfLines={1}>
              {place ?? 'Buscando el nombre del lugar…'}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.status, { color: toneColor[status.tone] }]}>{status.text}</Text>
        {status.detail ? <Text style={styles.statusDetail}>{status.detail}</Text> : null}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <AlertCircle size={18} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Prominent On-Demand Action Button */}
      <BigButton
        title={esperando ? 'Esperando respuesta…' : 'Solicitar Ubicación en Vivo'}
        icon={<Radio size={22} color={colors.textInverse} />}
        onPress={onRequestLocation}
        loading={esperando}
        style={styles.actionBtn}
      />
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  place: {
    ...Typography.subhead,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  status: {
    ...Typography.subhead,
    fontWeight: '700',
    marginTop: 4,
  },
  statusDetail: {
    ...Typography.footnote,
    color: colors.textSecondary,
    marginTop: 1,
  },
  header: {
    marginBottom: Spacing.md,
  },
  name: {
    ...Typography.title2,
    color: colors.textPrimary,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: -6,
    marginBottom: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  backText: {
    ...Typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: colors.dangerMuted,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.callout,
    color: colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  actionBtn: {
    marginTop: Spacing.xs,
  },
}));
