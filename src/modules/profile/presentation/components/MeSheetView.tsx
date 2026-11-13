import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, ChevronRight, Settings, SlidersHorizontal, UserPen } from 'lucide-react-native';
import { useAuthStore } from '../../../auth/application/auth.store';
import { isFamilyAdminRole } from '../../../family/presentation/components/family-roles';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Typography, Spacing } from '../../../../shared/theme/typography';

interface MeSheetViewProps {
  onLogout: () => void;
}

export const MeSheetView: React.FC<MeSheetViewProps> = ({ onLogout }) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const adminFamilies = (user?.families ?? []).filter((f) => isFamilyAdminRole(f.familyRole));
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'YO';

  return (
    <View style={styles.container}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
        </View>
      </View>

      {/* Accesos: perfil y familias que administra */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.row, adminFamilies.length === 0 && styles.lastRow]}
          onPress={() => router.push('/profile')}
          activeOpacity={0.6}
          accessibilityRole="button"
        >
          <View style={styles.rowIcon}>
            <UserPen size={20} color={colors.primary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Mi perfil</Text>
            <Text style={styles.rowSubtitle}>Nombre, teléfono y contraseña</Text>
          </View>
          <ChevronRight size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        {adminFamilies.map((family, index) => (
          <TouchableOpacity
            key={family.familyId}
            style={[styles.row, index === adminFamilies.length - 1 && styles.lastRow]}
            onPress={() => router.push(`/family/${family.familyId}`)}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <View style={styles.rowIcon}>
              <Settings size={20} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Administrar {family.familyName}</Text>
              <Text style={styles.rowSubtitle}>Añadir, editar o quitar familiares</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Configuración de la app: apariencia y estado de este teléfono */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.row, styles.lastRow]}
          onPress={() => router.push('/settings')}
          activeOpacity={0.6}
          accessibilityRole="button"
        >
          <View style={styles.rowIcon}>
            <SlidersHorizontal size={20} color={colors.primary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Configuración de la app</Text>
            <Text style={styles.rowSubtitle}>Modo oscuro, ubicación y privacidad</Text>
          </View>
          <ChevronRight size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Logout Action */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
        <LogOut size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    ...Typography.title2,
    color: colors.textInverse,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.headline,
    color: colors.textPrimary,
    fontSize: 18,
  },
  userPhone: {
    ...Typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.cardBackground,
    borderRadius: Spacing.borderRadiusMd,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...Typography.headline,
    color: colors.textPrimary,
    fontSize: 16,
  },
  rowSubtitle: {
    ...Typography.footnote,
    color: colors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    backgroundColor: colors.dangerMuted,
    borderRadius: Spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: colors.dangerBorder,
  },
  logoutText: {
    ...Typography.headline,
    color: colors.danger,
    fontWeight: '700',
    fontSize: 17,
  },
}));
