import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Smartphone, Shield, LogOut, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '../../../auth/application/auth.store';
import { Colors } from '../../../../shared/theme/colors';
import { Typography, Spacing } from '../../../../shared/theme/typography';

interface MeSheetViewProps {
  onLogout: () => void;
}

export const MeSheetView: React.FC<MeSheetViewProps> = ({ onLogout }) => {
  const { user } = useAuthStore();
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

      {/* Settings / Status List */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Smartphone size={20} color={Colors.primary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Este Dispositivo</Text>
            <Text style={styles.rowSubtitle}>Compartir mi ubicación con la familia</Text>
          </View>
          <View style={styles.activeTag}>
            <CheckCircle2 size={16} color={Colors.secondary} />
            <Text style={styles.activeTagText}>Activo</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Shield size={20} color={Colors.secondary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Privacidad</Text>
            <Text style={styles.rowSubtitle}>GPS sólo se activa bajo petición de tu familia</Text>
          </View>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
        <LogOut size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    ...Typography.title2,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.headline,
    color: Colors.textPrimary,
    fontSize: 18,
  },
  userPhone: {
    ...Typography.subhead,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusMd,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderSubtle,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...Typography.headline,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  rowSubtitle: {
    ...Typography.footnote,
    color: Colors.textSecondary,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeTagText: {
    ...Typography.footnote,
    color: Colors.secondary,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: Spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  logoutText: {
    ...Typography.headline,
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 17,
  },
});
