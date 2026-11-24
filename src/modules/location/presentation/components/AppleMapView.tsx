import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, ActivityIndicator, Linking, Alert } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Navigation, Plus, Minus } from 'lucide-react-native';
import * as Location from 'expo-location';
import { getFreshPosition } from '../../infrastructure/position-capture';
import { FamilyMemberSummary } from '../../../family/domain/entities/family.types';
import { LocationCoordinate } from '../../domain/entities/location.types';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing } from '../../../../shared/theme/typography';

interface AppleMapViewProps {
  members: FamilyMemberSummary[];
  locations: Record<string, LocationCoordinate>;
  selectedMember: FamilyMemberSummary | null;
  onSelectMember: (member: FamilyMemberSummary) => void;
  /** Usuario que usa la app: su marcador se etiqueta "Yo". */
  currentUserId?: string | null;
}

export interface CenterOnUserOptions {
  /** En modo silencioso (al abrir la app) no muestra alertas si falta permiso o señal GPS. */
  silent?: boolean;
}

/** Acciones del mapa que se pueden lanzar desde fuera (p. ej. al tocar "Yo" en la lista). */
export interface AppleMapViewHandle {
  centerOnUser: (options?: CenterOnUserOptions) => void;
}

/** Antigüedad máxima de la última posición conocida para mostrarla mientras llega la nueva. */
const QUICK_POSITION_MAX_AGE_MS = 5 * 60_000;
/** Tiempo máximo esperando una lectura nueva del GPS. */
const FRESH_POSITION_TIMEOUT_MS = 10_000;

/** Ubicación inicial del mapa al iniciar sesión (centro geográfico de Ecuador). */
const DEFAULT_LAT = -1.831239;
const DEFAULT_LNG = -78.183406;
/** Zoom inicial para encuadrar el territorio continental de Ecuador en pantalla. */
const DEFAULT_ZOOM = 6;

/** Margen superior de los controles flotantes; la atribución del mapa se alinea con ellos. */
const TOP_OFFSET = Platform.OS === 'ios' ? 60 : 44;

/**
 * La política de uso de las teselas de OpenStreetMap exige un User-Agent que identifique a
 * la app: el genérico del WebView puede bloquearse sin aviso. Se añade al del sistema.
 */
const USER_AGENT_SUFFIX = 'FindMyFamily/1.0 (com.kencrisgdev.findmyfamily)';

/** Único destino externo al que se permite salir desde el mapa: la página de la licencia. */
const OSM_COPYRIGHT_URL = 'https://www.openstreetmap.org/copyright';

export const AppleMapView = forwardRef<AppleMapViewHandle, AppleMapViewProps>(function AppleMapView(
  { members, locations, selectedMember, onSelectMember, currentUserId },
  ref
) {
  const styles = useStyles();
  const { colors, isDark } = useTheme();
  const webViewRef = useRef<WebView | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const isMapLoadedRef = useRef(false);
  const selectedMemberRef = useRef(selectedMember);
  const isLocatingRef = useRef(false);
  const pendingUserLocationRef = useRef<{
    coords: { latitude: number; longitude: number };
    fly: boolean;
  } | null>(null);

  isMapLoadedRef.current = isMapLoaded;
  selectedMemberRef.current = selectedMember;

  // Sync data to Leaflet webview
  const pushDataToMap = useCallback(() => {
    if (!isMapLoaded || !webViewRef.current) return;

    // El propio usuario aparece como "Yo"; el resto, por su nombre.
    const membersJson = JSON.stringify(
      members.map((m) => ({ ...m, label: m.userId === currentUserId ? 'Yo' : m.firstName }))
    );
    const locationsJson = JSON.stringify(locations);
    const selectedIdJson = JSON.stringify(selectedMember?.userId ?? null);

    const script = `
      if (window.updateMarkers) {
        window.updateMarkers(${membersJson}, ${locationsJson}, ${selectedIdJson});
      }
      true;
    `;
    webViewRef.current.injectJavaScript(script);
  }, [isMapLoaded, members, locations, selectedMember, currentUserId]);

  useEffect(() => {
    pushDataToMap();
  }, [pushDataToMap]);

  // El HTML del mapa no ve el tema de la app: se le comunica al cargar y en cada cambio.
  useEffect(() => {
    if (!isMapLoaded) return;
    webViewRef.current?.injectJavaScript(
      `if (window.setDarkMode) { window.setDarkMode(${isDark}); } true;`
    );
  }, [isMapLoaded, isDark]);

  // Center on selected member whenever they change
  useEffect(() => {
    if (!isMapLoaded || !selectedMember || !locations[selectedMember.userId] || !webViewRef.current) {
      return;
    }
    const loc = locations[selectedMember.userId];
    const script = `
      if (window.flyToLocation) {
        window.flyToLocation(${loc.latitude}, ${loc.longitude}, 16);
      }
      true;
    `;
    webViewRef.current.injectJavaScript(script);
  }, [isMapLoaded, selectedMember, locations]);

  // Handle messages from WebView
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setTimeout(() => {
          setIsMapLoaded(true);
        }, 0);
      } else if (data.type === 'MAP_ERROR') {
        setMapError(true);
      } else if (data.type === 'SELECT_MEMBER') {
        const found = members.find((m) => m.userId === data.userId);
        if (found) {
          onSelectMember(found);
        }
      }
    } catch (e) {
      console.warn('[AppleMapView] Error parsing message from WebView:', e);
    }
  };

  const injectUserLocation = useCallback(
    (coords: { latitude: number; longitude: number }, fly: boolean) => {
      webViewRef.current?.injectJavaScript(`
        if (window.setUserLocation) {
          window.setUserLocation(${coords.latitude}, ${coords.longitude});
        }
        ${
          fly
            ? `if (window.flyToLocation) {
          window.flyToLocation(${coords.latitude}, ${coords.longitude}, 16);
        }`
            : ''
        }
        true;
      `);
    },
    []
  );

  const showUserOnMap = useCallback(
    (coords: { latitude: number; longitude: number }, fly = true) => {
      if (!isMapLoadedRef.current || !webViewRef.current) {
        // Si la ubicación llega antes de que Leaflet termine de cargar, se guarda
        // para pintarla y centrar el mapa en cuanto se dispare MAP_READY.
        pendingUserLocationRef.current = { coords, fly };
        return;
      }
      injectUserLocation(coords, fly);
    },
    [injectUserLocation]
  );

  useEffect(() => {
    if (!isMapLoaded || !pendingUserLocationRef.current) return;
    const pending = pendingUserLocationRef.current;
    pendingUserLocationRef.current = null;
    const shouldFly = pending.fly && !selectedMemberRef.current;
    injectUserLocation(pending.coords, shouldFly);
  }, [isMapLoaded, injectUserLocation]);

  /**
   * Centra el mapa en el usuario. Antes esperaba una lectura nueva del GPS que, si no
   * llegaba, dejaba el botón sin hacer nada y sin ningún aviso. Ahora:
   *   1. muestra al instante la última posición conocida (si es reciente),
   *   2. la afina con una lectura nueva, esperando como mucho 10 s,
   *   3. y si no hay ninguna de las dos, lo dice (salvo en modo silencioso al iniciar).
   */
  const handleCenterOnUser = useCallback(
    async (options?: CenterOnUserOptions) => {
      if (isLocatingRef.current) return;
      isLocatingRef.current = true;
      setIsLocating(true);
      const silent = options?.silent ?? false;

      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted' && !silent) {
          ({ status } = await Location.requestForegroundPermissionsAsync());
        }
        if (status !== 'granted') {
          if (!silent) {
            Alert.alert(
              'Permiso de ubicación',
              'Para ver dónde estás, permite el acceso a la ubicación en los ajustes del teléfono.'
            );
          }
          return;
        }

        const canFly = () => !(silent && selectedMemberRef.current);

        const quick = await Location.getLastKnownPositionAsync({
          maxAge: QUICK_POSITION_MAX_AGE_MS,
        }).catch(() => null);
        if (quick) showUserOnMap(quick.coords, canFly());

        // Precisión alta = GPS. Con `Balanced`, Android solo usa wifi y antenas: sin ellas
        // (interiores sin wifi, o el emulador) no encendía el GPS y nunca llegaba respuesta.
        // Es una lectura única que el usuario pide a propósito, así que el consumo no importa.
        const fresh = await getFreshPosition(Location.Accuracy.High, FRESH_POSITION_TIMEOUT_MS);
        if (fresh) {
          showUserOnMap(fresh.coords, canFly());
        } else if (!quick && !silent) {
          Alert.alert(
            'No se encontró tu ubicación',
            'Comprueba que la ubicación del teléfono esté activada. Al aire libre el GPS la encuentra antes.'
          );
        }
      } finally {
        isLocatingRef.current = false;
        setIsLocating(false);
      }
    },
    [showUserOnMap]
  );

  const zoom = (direction: 'in' | 'out') => {
    webViewRef.current?.injectJavaScript(`
      if (window.map) { window.map.${direction === 'in' ? 'zoomIn' : 'zoomOut'}(); }
      true;
    `);
  };

  useImperativeHandle(
    ref,
    () => ({
      centerOnUser: (options?: CenterOnUserOptions) => void handleCenterOnUser(options),
    }),
    [handleCenterOnUser]
  );

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <!--
    CSP: esta página tiene en memoria las coordenadas de toda la familia. Solo puede cargar
    Leaflet y las teselas, y no puede enviar datos a ningún sitio (connect-src 'none'). Si
    algún día se colara código en la página, no tendría por dónde sacar la información.
  -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'unsafe-inline' https://cdnjs.cloudflare.com; img-src https://tile.openstreetmap.org data:; connect-src 'none'; form-action 'none'; base-uri 'none'" />
  <!-- integrity: si el CDN sirviera un archivo alterado, el navegador se negaría a usarlo. -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #f2f2f7;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
    }
    /* Atribución obligatoria por la licencia de OSM. Arriba a la izquierda porque la parte
       inferior la tapa la hoja de familiares, y la política prohíbe ocultarla bajo la interfaz. */
    .leaflet-top.leaflet-left {
      margin-top: ${TOP_OFFSET}px;
    }
    .leaflet-control-attribution {
      font-size: 10px;
      background: rgba(255, 255, 255, 0.8) !important;
      border-radius: 6px;
      margin-left: 8px !important;
    }
    /* Modo oscuro. OSM no ofrece teselas oscuras gratuitas: se invierten los colores del
       mapa y se rota el tono para que el agua siga siendo azul y los parques verdes. Solo
       afecta a las teselas; los marcadores tienen su propia versión oscura. */
    body.dark, body.dark #map { background-color: #000000; }
    body.dark .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.9); }
    body.dark .leaflet-control-attribution { background: rgba(28, 28, 30, 0.85) !important; color: #AEAEB2; }
    body.dark .leaflet-control-attribution a { color: #0A84FF; }
    body.dark .avatar-pin { background-color: #1C1C1E; border-color: #7D7AFF; }
    body.dark .avatar-pin-selected { background-color: #0A84FF; border-color: #0A84FF; }
    body.dark .avatar-text { color: #FFFFFF; }
    body.dark .name-tag { background-color: rgba(28, 28, 30, 0.94); border-color: rgba(255, 255, 255, 0.12); }
    body.dark .name-tag-text { color: #FFFFFF; }
    .leaflet-div-marker-container {
      background: transparent !important;
      border: none !important;
    }
    .marker-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
    }
    .pulse-ring {
      position: absolute;
      top: 22px;
      left: 32px;
      transform: translate(-50%, -50%);
      width: 64px;
      height: 64px;
      border-radius: 32px;
      background-color: rgba(0, 122, 255, 0.25);
      border: 2px solid #007AFF;
      animation: pulse 1.8s infinite ease-out;
      pointer-events: none;
    }
    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(0.9); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
    }
    .avatar-pin {
      width: 44px;
      height: 44px;
      border-radius: 22px;
      background-color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #5856D6;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
      z-index: 2;
    }
    .avatar-pin-selected {
      border-color: #007AFF;
      background-color: #007AFF;
      transform: scale(1.08);
    }
    .avatar-text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #1C1C1E;
    }
    .avatar-text-selected {
      color: #FFFFFF;
    }
    .name-tag {
      margin-top: 4px;
      background-color: rgba(255, 255, 255, 0.94);
      padding: 3px 8px;
      border-radius: 10px;
      border: 0.5px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
      max-width: 85px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      z-index: 2;
    }
    .name-tag-text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #1C1C1E;
    }
    .user-dot {
      width: 18px;
      height: 18px;
      border-radius: 9px;
      background-color: #007AFF;
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      position: relative;
    }
    .user-pulse {
      position: absolute;
      top: -6px;
      left: -6px;
      width: 24px;
      height: 24px;
      border-radius: 12px;
      background-color: rgba(0, 122, 255, 0.3);
      animation: userPulse 2s infinite ease-out;
    }
    @keyframes userPulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function post(message) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }

    // Sin conexión, o si el CDN no responde, Leaflet no existe: se avisa en lugar de dejar la
    // pantalla cargando para siempre.
    if (typeof L === 'undefined') {
      post({ type: 'MAP_ERROR' });
      throw new Error('Leaflet no se pudo cargar');
    }

    // Todo texto que venga de los usuarios se escapa antes de meterlo en HTML. El nombre lo
    // elige cada usuario: sin esto, un "nombre" con etiquetas HTML ejecutaría código en el
    // teléfono de cada familiar que abriera el mapa.
    function escapeHtml(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    var map = L.map('map', {
      // Los botones + y − son nativos (fuera del mapa), más grandes que los de Leaflet.
      zoomControl: false,
      attributionControl: false,
      // Gestos: pellizcar con dos dedos y doble toque para acercar. Leaflet los trae
      // activados, pero se dejan explícitos para que no dependan de valores por defecto.
      touchZoom: true,
      doubleClickZoom: true,
      bounceAtZoomLimits: false,
      minZoom: 3,
      maxZoom: 19
    }).setView([${DEFAULT_LAT}, ${DEFAULT_LNG}], ${DEFAULT_ZOOM});

    L.control.attribution({ position: 'topleft', prefix: false }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="${OSM_COPYRIGHT_URL}">OpenStreetMap</a>'
    }).addTo(map);

    var markersMap = {};
    var userMarker = null;

    window.setDarkMode = function(enabled) {
      document.body.classList.toggle('dark', !!enabled);
    };

    window.flyToLocation = function(lat, lng, zoom) {
      map.flyTo([lat, lng], zoom || 15, { duration: 0.8 });
    };

    window.setUserLocation = function(lat, lng) {
      var icon = L.divIcon({
        className: 'leaflet-div-marker-container',
        html: '<div class="user-dot"><div class="user-pulse"></div></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = L.marker([lat, lng], { icon: icon }).addTo(map);
      }
    };

    window.updateMarkers = function(members, locations, selectedUserId) {
      var activeIds = {};
      members.forEach(function(m) {
        if (locations[m.userId]) {
          activeIds[m.userId] = true;
        }
      });

      // Remove deleted markers
      Object.keys(markersMap).forEach(function(id) {
        if (!activeIds[id]) {
          map.removeLayer(markersMap[id]);
          delete markersMap[id];
        }
      });

      // Add or update markers
      members.forEach(function(member) {
        var loc = locations[member.userId];
        if (!loc) return;

        var isSelected = (selectedUserId === member.userId);
        var fChar = member.firstName ? member.firstName.charAt(0) : '';
        var lChar = member.lastName ? member.lastName.charAt(0) : '';
        var initials = escapeHtml((fChar + lChar).toUpperCase());

        var pulseHtml = isSelected ? '<div class="pulse-ring"></div>' : '';
        var pinClass = isSelected ? 'avatar-pin avatar-pin-selected' : 'avatar-pin';
        var textClass = isSelected ? 'avatar-text avatar-text-selected' : 'avatar-text';

        var iconHtml =
          '<div class="marker-wrapper">' +
            pulseHtml +
            '<div class="' + pinClass + '">' +
              '<span class="' + textClass + '">' + initials + '</span>' +
            '</div>' +
            '<div class="name-tag">' +
              '<span class="name-tag-text">' + escapeHtml(member.label || member.firstName) + '</span>' +
            '</div>' +
          '</div>';

        var icon = L.divIcon({
          className: 'leaflet-div-marker-container',
          html: iconHtml,
          iconSize: [64, 75],
          iconAnchor: [32, 22]
        });

        if (markersMap[member.userId]) {
          markersMap[member.userId].setLatLng([loc.latitude, loc.longitude]);
          markersMap[member.userId].setIcon(icon);
          if (isSelected) {
            markersMap[member.userId].setZIndexOffset(1000);
          } else {
            markersMap[member.userId].setZIndexOffset(0);
          }
        } else {
          var m = L.marker([loc.latitude, loc.longitude], { icon: icon });
          m.on('click', function() {
            post({ type: 'SELECT_MEMBER', userId: member.userId });
          });
          m.addTo(map);
          if (isSelected) m.setZIndexOffset(1000);
          markersMap[member.userId] = m;
        }
      });
    };

    // Notify React Native that map is ready
    setTimeout(function() {
      map.invalidateSize();
      post({ type: 'MAP_READY' });
    }, 150);
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        onMessage={handleMessage}
        onError={() => setMapError(true)}
        applicationNameForUserAgent={USER_AGENT_SUFFIX}
        // El WebView solo muestra el mapa: nunca navega a otra página. El enlace de la
        // licencia de OSM se abre en el navegador; cualquier otra navegación se bloquea.
        onShouldStartLoadWithRequest={(request) => {
          if (request.url === 'about:blank' || request.url.startsWith('data:')) return true;
          if (request.url.startsWith(OSM_COPYRIGHT_URL)) void Linking.openURL(OSM_COPYRIGHT_URL);
          return false;
        }}
        setSupportMultipleWindows={false}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

      {!isMapLoaded && (
        <View style={styles.loaderContainer}>
          {mapError ? (
            <Text style={styles.errorText}>
              No se pudo cargar el mapa. Revisa tu conexión a internet y vuelve a abrir la app.
            </Text>
          ) : (
            <ActivityIndicator size="large" color={colors.primary} />
          )}
        </View>
      )}

      {/* Floating Apple-like Controls Top Right */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={styles.controlButton}
          activeOpacity={0.8}
          onPress={() => void handleCenterOnUser()}
          accessibilityRole="button"
          accessibilityLabel="Mostrar dónde estoy"
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Navigation size={22} color={colors.primary} />
          )}
        </TouchableOpacity>

        {/* Zoom. Sustituye al antiguo botón de "brújula", que en realidad solo ponía el zoom
            en 14 y nadie sabía para qué servía. */}
        <View style={styles.zoomGroup}>
          <TouchableOpacity
            style={styles.zoomButton}
            activeOpacity={0.6}
            onPress={() => zoom('in')}
            accessibilityRole="button"
            accessibilityLabel="Acercar el mapa"
          >
            <Plus size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomButton}
            activeOpacity={0.6}
            onPress={() => zoom('out')}
            accessibilityRole="button"
            accessibilityLabel="Alejar el mapa"
          >
            <Minus size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const useStyles = makeStyles((colors) => ({
  container: {
    ...StyleSheet.absoluteFill,
  },
  map: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    fontSize: 15,
  },
  floatingControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 44,
    right: Spacing.lg,
    gap: Spacing.sm,
    zIndex: 10,
  },
  zoomGroup: {
    width: 46,
    borderRadius: 23,
    backgroundColor: colors.floatingControl,
    overflow: 'hidden',
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
  },
  zoomButton: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 10,
    backgroundColor: colors.border,
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.floatingControl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: colors.borderSubtle,
  },
}));
