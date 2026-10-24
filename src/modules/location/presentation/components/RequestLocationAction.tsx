import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Radio, X, CheckCircle, AlertCircle, Clock, WifiOff } from 'lucide-react-native';
import { FamilyMemberSummary } from '../../../family/domain/entities/family.types';
import { LocationCoordinate } from '../../domain/entities/location.types';
import { MemberRequestState } from '../../application/location.store';
import { BigButton } from '../../../../shared/presentation/components/BigButton';
import { Colors } from '../../../../shared/theme/colors';
import { Typography, Spacing } from '../../../../shared/theme/typography';
import { formatRelativeTime } from '../../../../shared/presentation/utils/format-relative-time';

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
  const esperando = requestState.status === 'waiting';

  const formatTime = (iso?: string) => {
    if (!iso) return 'Sin ubicaciones registradas';
    return `Última ubicación ${formatRelativeTime(iso)}`;
  };

  return (
    <View style={styles.container}>
      {/* Header with Close */}
      <View style={styles.header}>
        <View style={styles.titleInfo}>
          <Text style={styles.name}>
            {member.firstName} {member.lastName}
          </Text>
          <View style={styles.subtitleRow}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.subtitle}>{formatTime(location?.capturedAt)}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onDeselect} style={styles.closeBtn} activeOpacity={0.7}>
          <X size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Status Feedback Banners */}
      {requestState.status === 'waiting' && requestState.message ? (
        <View style={styles.messageBanner}>
          <CheckCircle size={18} color={Colors.secondary} />
          <Text style={styles.messageText}>{requestState.message}</Text>
        </View>
      ) : null}

      {/* Familiar inalcanzable: se muestra el motivo junto a la hora de su última
          ubicación conocida, que es lo que sigue pintado en el mapa. */}
      {requestState.status === 'unavailable' && requestState.message ? (
        <View style={styles.unavailableBanner}>
          <WifiOff size={18} color={Colors.warning} />
          <Text style={styles.unavailableText}>{requestState.message}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner}>
          <AlertCircle size={18} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Prominent On-Demand Action Button */}
      <BigButton
        title={esperando ? 'Esperando respuesta…' : 'Solicitar Ubicación en Vivo'}
        icon={<Radio size={22} color={Colors.textInverse} />}
        onPress={onRequestLocation}
        loading={esperando}
        style={styles.actionBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleInfo: {
    flex: 1,
  },
  name: {
    ...Typography.title2,
    color: Colors.textPrimary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    ...Typography.footnote,
    color: Colors.textSecondary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
  },
  unavailableText: {
    ...Typography.callout,
    color: Colors.textPrimary,
    flex: 1,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
  },
  messageText: {
    ...Typography.callout,
    color: Colors.secondary,
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.callout,
    color: Colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  actionBtn: {
    marginTop: Spacing.xs,
  },
});
