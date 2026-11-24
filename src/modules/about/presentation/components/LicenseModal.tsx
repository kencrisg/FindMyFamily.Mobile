import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ExternalLink, Scale, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OpenSourceLicenseItem } from '../data/open-source-licenses';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing, Typography } from '../../../../shared/theme/typography';

interface LicenseModalProps {
  item: OpenSourceLicenseItem | null;
  onClose: () => void;
  onOpenUrl: (url: string) => void;
}

/** Hoja modal de solo lectura para mostrar el texto completo de una licencia de código abierto. */
export const LicenseModal: React.FC<LicenseModalProps> = ({ item, onClose, onOpenUrl }) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!item) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Scale size={20} color={colors.primary} />
              <Text style={styles.title} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <Badge label={item.license} tone="primary" />
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator>
            <Text style={styles.copyright}>© {item.copyright}</Text>
            <Text style={styles.licenseBody}>{item.licenseText}</Text>
          </ScrollView>

          {item.url ? (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => onOpenUrl(item.url!)}
              activeOpacity={0.7}
              accessibilityRole="link"
            >
              <ExternalLink size={18} color={colors.primary} />
              <Text style={styles.linkBtnText}>Ver en la web</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const useStyles = makeStyles((colors) => ({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: Spacing.borderRadiusLg,
    borderTopRightRadius: Spacing.borderRadiusLg,
    padding: Spacing.xl,
    maxHeight: '82%',
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.title3,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.footnote,
    color: colors.textSecondary,
    flex: 1,
  },
  scroll: {
    backgroundColor: colors.background,
    borderRadius: Spacing.borderRadiusSm,
    padding: Spacing.md,
    maxHeight: 340,
  },
  copyright: {
    ...Typography.footnote,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  licenseBody: {
    ...Typography.footnote,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    backgroundColor: colors.primaryMuted,
  },
  linkBtnText: {
    ...Typography.headline,
    color: colors.primary,
    fontSize: 15,
  },
}));
