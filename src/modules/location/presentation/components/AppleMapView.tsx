import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Navigation, Layers, Compass } from 'lucide-react-native';
import * as Location from 'expo-location';
import { FamilyMemberSummary } from '../../../family/domain/entities/family.types';
import { LocationCoordinate } from '../../domain/entities/location.types';
import { MemberMapMarker } from './MemberMapMarker';
import { Colors } from '../../../../shared/theme/colors';
import { Spacing } from '../../../../shared/theme/typography';

interface AppleMapViewProps {
  members: FamilyMemberSummary[];
  locations: Record<string, LocationCoordinate>;
  selectedMember: FamilyMemberSummary | null;
  onSelectMember: (member: FamilyMemberSummary) => void;
}

const INITIAL_REGION: Region = {
  latitude: 19.432608,
  longitude: -99.133209,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const AppleMapView: React.FC<AppleMapViewProps> = ({
  members,
  locations,
  selectedMember,
  onSelectMember,
}) => {
  const mapRef = useRef<MapView | null>(null);

  // Focus map on selected member whenever they change and have a location
  useEffect(() => {
    if (selectedMember && locations[selectedMember.userId] && mapRef.current) {
      const loc = locations[selectedMember.userId];
      mapRef.current.animateToRegion(
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800
      );
    }
  }, [selectedMember, locations]);

  const handleCenterOnUser = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          800
        );
      }
    } catch (e) {
      console.warn('Could not get user position:', e);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {members.map((member) => {
          const loc = locations[member.userId];
          if (!loc) return null;
          return (
            <MemberMapMarker
              key={member.userId}
              member={member}
              location={loc}
              isSelected={selectedMember?.userId === member.userId}
              onPress={() => onSelectMember(member)}
            />
          );
        })}
      </MapView>

      {/* Floating Apple-like Controls Top Right */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={styles.controlButton}
          activeOpacity={0.8}
          onPress={handleCenterOnUser}
        >
          <Navigation size={22} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
          <Compass size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  floatingControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 44,
    right: Spacing.lg,
    gap: Spacing.sm,
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowElevated,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: Colors.borderSubtle,
  },
});
