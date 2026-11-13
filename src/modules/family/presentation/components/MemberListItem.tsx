import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { FamilyMemberSummary } from '../../domain/entities/family.types';
import { LocationCoordinate } from '../../../location/domain/entities/location.types';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Typography, Spacing } from '../../../../shared/theme/typography';
import { MemberRequestState } from '../../../location/application/location.store';
import { usePlaceName } from '../../../location/presentation/hooks/use-place-name';
import {
  describeMemberLocation,
  StatusTone,
  useNow,
} from '../../../location/presentation/utils/member-location-status';

interface MemberListItemProps {
  member: FamilyMemberSummary;
  location?: LocationCoordinate | null;
  /** Estado de la última petición de ubicación a este familiar. */
  requestState?: MemberRequestState;
  isSelected?: boolean;
  /** Es el propio usuario: se muestra como "Yo" y al tocarlo se ve dónde está. */
  isMe?: boolean;
  onPress: () => void;
}

export const MemberListItem: React.FC<MemberListItemProps> = ({
  member,
  location,
  requestState,
  isSelected = false,
  isMe = false,
  onPress,
}) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
  const now = useNow();
  const place = usePlaceName(requestState?.status === 'sharing-disabled' ? null : location);
  const status = describeMemberLocation(location, requestState, now);
  const toneColor: Record<StatusTone, string> = {
    live: colors.secondary,
    warning: colors.warning,
    active: colors.primary,
    muted: colors.textSecondary,
  };

  // Línea de estado: para uno mismo, la acción; sin datos ni petición en curso, la
  // invitación a pedirla; en el resto, lo mismo que dice la tarjeta del familiar.
  const hasRequestOutcome =
    requestState?.status === 'waiting' ||
    requestState?.status === 'unavailable' ||
    requestState?.status === 'sharing-disabled';
  const [statusText, statusColor] = isMe
    ? ['Toca para ver dónde estás', colors.textSecondary]
    : !location && !hasRequestOutcome
      ? ['Toca para solicitar ubicación', colors.textSecondary]
      : [status.text, toneColor[status.tone]];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, isSelected && styles.selectedContainer]}
    >
      {/* Left Avatar with Initial Badge */}
      <View style={[styles.avatar, isSelected && styles.selectedAvatar]}>
        <Text style={[styles.avatarText, isSelected && styles.selectedAvatarText]}>
          {initials}
        </Text>
      </View>

      {/* Center Details */}
      <View style={styles.details}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {isMe ? 'Yo' : `${member.firstName} ${member.lastName}`}
          </Text>
          {member.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {place && !isMe ? (
          <Text style={styles.place} numberOfLines={1}>
            {place}
          </Text>
        ) : null}
        <Text
          style={[styles.subtitle, { color: statusColor }]}
          numberOfLines={1}
        >
          {statusText}
        </Text>
      </View>

      <ChevronRight size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );
};

const useStyles = makeStyles((colors) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.borderRadiusMd,
    backgroundColor: 'transparent',
    marginBottom: Spacing.xs,
  },
  selectedContainer: {
    backgroundColor: colors.primarySubtle,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
  },
  selectedAvatar: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  avatarText: {
    ...Typography.headline,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  selectedAvatarText: {
    color: colors.textInverse,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  name: {
    ...Typography.headline,
    color: colors.textPrimary,
    fontSize: 17,
  },
  adminBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  place: {
    ...Typography.subhead,
    color: colors.textPrimary,
    marginTop: 1,
  },
  subtitle: {
    ...Typography.subhead,
    color: colors.textSecondary,
    fontSize: 14,
  },
}));
