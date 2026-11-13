import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, User, Settings, RefreshCw } from 'lucide-react-native';

import { useAuthStore } from '../../../auth/application/auth.store';
import { useFamilyStore } from '../../../family/application/family.store';
import { useLocationStore } from '../../application/location.store';

import { AppleMapView, AppleMapViewHandle } from '../components/AppleMapView';
import { MemberListItem } from '../../../family/presentation/components/MemberListItem';
import { RequestLocationAction } from '../components/RequestLocationAction';
import { MeSheetView } from '../../../profile/presentation/components/MeSheetView';

import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Typography, Spacing } from '../../../../shared/theme/typography';
import { BackgroundTaskManager } from '../../infrastructure/background-task.manager';

type TabType = 'people' | 'me';

export const FindMyMainScreen: React.FC = () => {
  const styles = useStyles();
  const { colors } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<AppleMapViewHandle>(null);
  const router = useRouter();
  // La app se dibuja de borde a borde: la barra de navegación de Android tapaba las pestañas.
  const insets = useSafeAreaInsets();
  // Altura real de la barra de pestañas (incluye el margen de la barra de navegación del
  // sistema). La hoja la usa como `bottomInset` para quedarse siempre por encima de ella.
  const [tabBarHeight, setTabBarHeight] = useState(64 + insets.bottom);

  const { logout, isFamilyAdmin } = useAuthStore();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const {
    families,
    activeFamily,
    selectedMember,
    isLoading: familyLoading,
    fetchFamilies,
    setSelectedMember,
  } = useFamilyStore();

  const canManageMembers = activeFamily ? isFamilyAdmin(activeFamily.id) : false;

  const {
    locations,
    error: locationError,
    requestLocation,
    getRequestState,
    cancelRequest,
    startSignalR,
    stopSignalR,
    clearStatus,
  } = useLocationStore();

  // Suscripción al mapa de peticiones para que la pantalla se repinte cuando el
  // temporizador marque a un familiar como no disponible.
  const requests = useLocationStore((state) => state.requests);

  const [activeTab, setActiveTab] = useState<TabType>('people');
  const [permissionWarning, setPermissionWarning] = useState<string | null>(null);

  // El propio usuario va primero y se muestra como "Yo".
  const members = useMemo(() => {
    const list = activeFamily?.members ?? [];
    return [...list].sort((a, b) => Number(b.userId === currentUserId) - Number(a.userId === currentUserId));
  }, [activeFamily, currentUserId]);

  /**
   * Pedirse la ubicación a uno mismo no tiene sentido: mandaría una notificación silenciosa
   * a este mismo teléfono. Tocarse a uno mismo centra el mapa en su posición y baja la hoja
   * para que se vea.
   */
  const showMyself = () => {
    setSelectedMember(null);
    clearStatus();
    bottomSheetRef.current?.snapToIndex(0);
    mapRef.current?.centerOnUser();
  };

  // Snap points for the Apple Find My bottom sheet
  const snapPoints = useMemo(() => ['18%', '45%', '85%'], []);

  useEffect(() => {
    // 1. Fetch initial families & members
    fetchFamilies();

    // 2. Request permissions. El resultado se muestra: antes se descartaba y el usuario
    //    no sabía que su teléfono no podría responder a las peticiones de la familia.
    BackgroundTaskManager.requestPermissions().then((permissions) => {
      if (!permissions.foreground) {
        setPermissionWarning(
          'Sin permiso de ubicación, tu familia no podrá localizarte. Actívalo en los ajustes del teléfono.'
        );
      } else if (!permissions.background) {
        setPermissionWarning(
          'Falta el permiso de ubicación en segundo plano: solo podrás compartir tu ubicación con la app abierta.'
        );
      } else {
        setPermissionWarning(null);
      }
    });

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
        // No se navega a mano: al pasar la sesión a `unauthenticated`, Stack.Protected
        // saca al usuario de esta pantalla y lo lleva al login.
        onPress: logout,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 1. Full Screen Interactive Map */}
      <AppleMapView
        ref={mapRef}
        members={members}
        locations={locations}
        selectedMember={selectedMember}
        currentUserId={currentUserId}
        onSelectMember={(member) => {
          if (member.userId === currentUserId) {
            showMyself();
            return;
          }
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
        bottomInset={tabBarHeight}
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
                  <RefreshCw size={18} color={colors.textPrimary} />
                </TouchableOpacity>
                {canManageMembers && activeFamily && (
                  <TouchableOpacity
                    style={[styles.actionIconBtn, styles.addIconBtn]}
                    onPress={() => router.push(`/family/${activeFamily.id}`)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Administrar familia"
                  >
                    <Settings size={20} color={colors.textPrimary} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Aviso de permisos insuficientes */}
          {permissionWarning && activeTab === 'me' ? (
            <View style={styles.permissionBanner}>
              <Text style={styles.permissionBannerText}>{permissionWarning}</Text>
            </View>
          ) : null}

          {/* Content Body */}
          <View style={styles.body}>
            {activeTab === 'people' ? (
              selectedMember && activeFamily ? (
                <RequestLocationAction
                  member={selectedMember}
                  familyId={activeFamily.id}
                  location={locations[selectedMember.userId]}
                  requestState={requests[selectedMember.userId] ?? getRequestState(selectedMember.userId)}
                  error={locationError}
                  onRequestLocation={handleRequestLocation}
                  onDeselect={() => {
                    cancelRequest(selectedMember.userId);
                    setSelectedMember(null);
                    clearStatus();
                  }}
                />
              ) : (
                <FlatList
                  data={members}
                  keyExtractor={(item) => item.userId}
                  renderItem={({ item }) => {
                    const isMe = item.userId === currentUserId;
                    return (
                      <MemberListItem
                        member={item}
                        location={locations[item.userId]}
                        requestState={requests[item.userId]}
                        isSelected={selectedMember?.userId === item.userId}
                        isMe={isMe}
                        onPress={
                          isMe
                            ? showMyself
                            : () => {
                                setSelectedMember(item);
                                clearStatus();
                              }
                        }
                      />
                    );
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>
                        {familyLoading
                          ? 'Cargando tu círculo familiar...'
                          : canManageMembers
                            ? 'Aún no hay familiares en este grupo. Toca el engranaje para añadirlos.'
                            : 'Aún no hay familiares en este grupo.'}
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

        </BottomSheetView>
      </BottomSheet>

      {/* 3. Barra de pestañas fija. Va fuera de la hoja a propósito: dentro subía y bajaba
          con ella. La hoja se desliza por encima gracias a `bottomInset`. */}
      <View
        style={[styles.tabsBar, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}
        onLayout={(event) => setTabBarHeight(event.nativeEvent.layout.height)}
      >
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
            color={activeTab === 'people' ? colors.primary : colors.textTertiary}
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
            // "Yo" tiene más contenido que la lista: a media altura, la configuración y el
            // cierre de sesión quedaban ocultos y había que saber arrastrar la hoja.
            bottomSheetRef.current?.snapToIndex(2);
          }}
          activeOpacity={0.8}
        >
          <User
            size={24}
            color={activeTab === 'me' ? colors.primary : colors.textTertiary}
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

    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheetBackground: {
    backgroundColor: colors.sheetBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetIndicator: {
    backgroundColor: colors.handle,
    width: 38,
    height: 5,
    borderRadius: 3,
  },
  sheetContent: {
    flex: 1,
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
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  membersCount: {
    ...Typography.footnote,
    color: colors.textSecondary,
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
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconBtn: {
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    flex: 1,
  },
  permissionBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    backgroundColor: colors.warningMuted,
  },
  permissionBannerText: {
    ...Typography.footnote,
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
  tabsBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.tabBarBackground,
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
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
}));
