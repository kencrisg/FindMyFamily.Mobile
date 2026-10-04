import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { FamilyMemberSummary } from '../../../family/domain/entities/family.types';
import { LocationCoordinate } from '../../domain/entities/location.types';
import { Colors } from '../../../../shared/theme/colors';
import { Typography } from '../../../../shared/theme/typography';

interface MemberMapMarkerProps {
  member: FamilyMemberSummary;
  location: LocationCoordinate;
  isSelected?: boolean;
  onPress?: () => void;
}

export const MemberMapMarker: React.FC<MemberMapMarkerProps> = ({
  member,
  location,
  isSelected = false,
  onPress,
}) => {
  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();

  return (
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        {/* Pulsing Outer Ring if Selected */}
        {isSelected && <View style={styles.pulseRing} />}

        {/* Circular Avatar Pin */}
        <View style={[styles.avatarPin, isSelected && styles.avatarPinSelected]}>
          <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
            {initials}
          </Text>
        </View>

        {/* Name Tag Below Marker */}
        <View style={styles.nameTag}>
          <Text style={styles.nameTagText} numberOfLines={1}>
            {member.firstName}
          </Text>
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 122, 255, 0.25)',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.secondary,
    shadowColor: Colors.shadowElevated,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  avatarPinSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  avatarText: {
    ...Typography.headline,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  avatarTextSelected: {
    color: Colors.textInverse,
  },
  nameTag: {
    marginTop: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  nameTagText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
