import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Battery, BatteryCharging, ShieldAlert } from 'lucide-react-native';
import { FamilyMemberSummary } from '../../domain/entities/family.types';
import { LocationCoordinate } from '../../../location/domain/entities/location.types';
import { Colors } from '../../../../shared/theme/colors';
import { Typography, Spacing } from '../../../../shared/theme/typography';
import { formatRelativeTime } from '../../../../shared/presentation/utils/format-relative-time';

interface MemberListItemProps {
  member: FamilyMemberSummary;
  location?: LocationCoordinate | null;
  isSelected?: boolean;
  onPress: () => void;
}

export const MemberListItem: React.FC<MemberListItemProps> = ({
  member,
  location,
  isSelected = false,
  onPress,
}) => {
  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();

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
            {member.firstName} {member.lastName}
          </Text>
          {member.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        <Text style={styles.subtitle} numberOfLines={1}>
          {location ? `Última ubicación • ${formatRelativeTime(location.capturedAt)}` : 'Toca para solicitar ubicación'}
        </Text>
      </View>

      {/* Right Action / Status */}
      <View style={styles.rightAction}>
        {location ? (
          <View style={styles.liveTag}>
            <View style={styles.greenDot} />
            <Text style={styles.liveText}>GPS Activo</Text>
          </View>
        ) : (
          <ChevronRight size={20} color={Colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.borderSubtle,
  },
  selectedAvatar: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  avatarText: {
    ...Typography.headline,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  selectedAvatarText: {
    color: Colors.textInverse,
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
    color: Colors.textPrimary,
    fontSize: 17,
  },
  adminBadge: {
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  rightAction: {
    marginLeft: Spacing.sm,
    alignItems: 'flex-end',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  liveText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: '700',
    fontSize: 11,
  },
});
