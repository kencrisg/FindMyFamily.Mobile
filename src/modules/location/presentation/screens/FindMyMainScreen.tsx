import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Users, User, Plus, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAuthStore } from '../../../auth/application/auth.store';
import { useFamilyStore } from '../../../family/application/family.store';
import { useLocationStore } from '../../application/location.store';

import { AppleMapView } from '../components/AppleMapView';
import { MemberListItem } from '../../../family/presentation/components/MemberListItem';
import { AddMemberModal } from '../../../family/presentation/components/AddMemberModal';
import { RequestLocationAction } from '../components/RequestLocationAction';
import { MeSheetView } from '../../../profile/presentation/components/MeSheetView';
import { GlassView } from '../../../../shared/presentation/components/GlassView';

import { Colors } from '../../../../shared/theme/colors';
import { Typography, Spacing } from '../../../../shared/theme/typography';
import { BackgroundTaskManager } from '../../infrastructure/background-task.manager';

type TabType = 'people' | 'me';

export const FindMyMainScreen: React.FC = () => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { logout } = useAuthStore();
  const {
    families,
    activeFamily,
    selectedMember,
    isLoading: familyLoading,
    fetchFamilies,
    addMember,
    setSelectedMember,
  } = useFamilyStore();

  const {
    locations,
    isRequesting,
    requestMessage,
    error: locationError,
    requestLocation,
    startSignalR,
    stopSignalR,
    clearStatus,
  } = useLocationStore();

  const [activeTab, setActiveTab] = useState<TabType>('people');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Snap points for the Apple Find My bottom sheet
  const snapPoints = useMemo(() => ['18%', '45%', '85%'], []);

  useEffect(() => {
    // 1. Fetch initial families & members
    fetchFamilies();

    // 2. Request permissions
    BackgroundTaskManager.requestPermissions();

    // 3. Connect to SignalR real-time hub
    startSignalR();

    return () => {
      stopSignalR();
    };
  }, []);

  const handleRequestLocation = async () => {
    if (!selectedMember || !activeFamily) return;
    await requestLocation(selectedMember.userId, activeFamily.id);
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 1. Full Screen Interactive Map */}
      <AppleMapView
        members={activeFamily?.members || []}
        locations={locations}
        selectedMember={selectedMember}
        onSelectMember={(member) => {
          setSelectedMember(member);
          clearStatus();
          bottomSheetRef.current?.snapToIndex(1);
        }}
      />

      {/* 2. Apple Find My Frosted Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        handleIndicatorStyle={styles.sheetIndicator}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetView style={styles.sheetContent}>
          {/* Header Bar */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.sheetTitle}>
                {activeTab === 'people'
                  ? activeFamily?.name || 'Familiares'
                  : 'Mi Perfil'}
              </Text>
              {activeFamily && activeTab === 'people' ? (
                <Text style={styles.membersCount}>
                  {activeFamily.members.length} {activeFamily.members.length === 1 ? 'familiar' : 'familiares'}
                </Text>
              ) : null}
            </View>

            {activeTab === 'people' && (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => fetchFamilies()}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionIconBtn, styles.addIconBtn]}
                  onPress={() => setIsAddModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Plus size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Content Body */}
          <View style={styles.body}>
            {activeTab === 'people' ? (
              selectedMember && activeFamily ? (
                <RequestLocationAction
                  member={selectedMember}
                  familyId={activeFamily.id}
                  location={locations[selectedMember.userId]}
                  isRequesting={isRequesting}
                  requestMessage={requestMessage}
                  error={locationError}
                  onRequestLocation={handleRequestLocation}
                  onDeselect={() => {
                    setSelectedMember(null);
                    clearStatus();
                  }}
                />
              ) : (
                <FlatList
                  data={activeFamily?.members || []}
                  keyExtractor={(item) => item.userId}
                  renderItem={({ item }) => (
                    <MemberListItem
                      member={item}
                      location={locations[item.userId]}
                      isSelected={selectedMember?.userId === item.userId}
                      onPress={() => {
                        setSelectedMember(item);
                        clearStatus();
                      }}
                    />
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>
                        {familyLoading
                          ? 'Cargando tu círculo familiar...'
                          : 'No tienes familiares en este grupo aún. Toca + para invitar a uno.'}
                      </Text>
                    </View>
                  }
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              )
            ) : (
              <MeSheetView onLogout={handleLogout} />
            )}
          </View>

          {/* Bottom Tabs Bar (Apple Find My style: People | Me) */}
          <View style={styles.tabsBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'people' && styles.activeTabItem]}
              onPress={() => {
                setActiveTab('people');
                setSelectedMember(null);
              }}
              activeOpacity={0.8}
            >
              <Users
                size={24}
                color={activeTab === 'people' ? Colors.primary : Colors.textTertiary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'people' && styles.activeTabLabel,
                ]}
              >
                Personas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'me' && styles.activeTabItem]}
              onPress={() => {
                setActiveTab('me');
                setSelectedMember(null);
              }}
              activeOpacity={0.8}
            >
              <User
                size={24}
                color={activeTab === 'me' ? Colors.primary : Colors.textTertiary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'me' && styles.activeTabLabel,
                ]}
              >
                Yo
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Add Member Modal */}
      <AddMemberModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={addMember}
        isLoading={familyLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sheetBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: Colors.shadowElevated,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetIndicator: {
    backgroundColor: '#C5C5C7',
    width: 38,
    height: 5,
    borderRadius: 3,
  },
  sheetContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  sheetTitle: {
    ...Typography.title1,
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  membersCount: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconBtn: {
    backgroundColor: Colors.surfaceMuted,
  },
  body: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
  tabsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.borderSubtle,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: Spacing.xxl,
  },
  activeTabItem: {},
  tabLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 11,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
