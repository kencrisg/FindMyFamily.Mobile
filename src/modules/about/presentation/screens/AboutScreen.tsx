import React, { useState } from 'react';
import { Alert, Image, Linking, ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import {
  FileText,
  GitBranch,
  Mail,
  Scale,
  Server,
  Smartphone,
  User,
} from 'lucide-react-native';
import {
  APP_INFO,
  APP_LICENSE_ENTRY,
  OPEN_SOURCE_LICENSES,
  OpenSourceLicenseItem,
} from '../data/open-source-licenses';
import { LicenseModal } from '../components/LicenseModal';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { ListRow } from '../../../../shared/presentation/components/ListRow';
import { Section } from '../../../../shared/presentation/components/Section';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing, Typography } from '../../../../shared/theme/typography';

async function openExternalUrl(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('No se pudo abrir el enlace', url);
  }
}

/** Acerca de FindMyFamily: información del creador, código abierto, GitHub y licencias. */
export const AboutScreen: React.FC = () => {
  const styles = useStyles();
  const { colors } = useTheme();
  const [selectedLicense, setSelectedLicense] = useState<OpenSourceLicenseItem | null>(null);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.appIcon}>
            <Image
              source={require('../../../../../assets/icon.png')}
              style={styles.appIconImage}
              resizeMode="cover"
              accessibilityLabel={`Icono de ${APP_INFO.name}`}
            />
          </View>
          <Text style={styles.appName}>{APP_INFO.name}</Text>
          <Text style={styles.version}>Versión {appVersion}</Text>
          <View style={styles.badges}>
            <Badge label="Código abierto" tone="success" />
            <Badge label="Licencia MIT" tone="primary" />
          </View>
          <Text style={styles.description}>
            Localización familiar bajo demanda.
          </Text>
        </View>

        <Section title="Autor y desarrollador">
          <ListRow
            title={APP_INFO.authorName}
            subtitle={`@${APP_INFO.authorHandle} · Creador y desarrollador`}
            icon={<User size={20} color={colors.primary} />}
          />
          <ListRow
            title="Perfil de GitHub"
            subtitle="github.com/kencrisg"
            icon={<GitBranch size={20} color={colors.primary} />}
            onPress={() => void openExternalUrl(APP_INFO.githubProfileUrl)}
          />
        </Section>

        <Section
          title="Código abierto"
          footer="FindMyFamily es software de código abierto. Puedes revisar el código fuente, reportar problemas o contribuir en GitHub."
        >
          <ListRow
            title="Repositorio Móvil (GitHub)"
            subtitle="github.com/kencrisg/FindMyFamily.Mobile"
            icon={<Smartphone size={20} color={colors.primary} />}
            onPress={() => void openExternalUrl(APP_INFO.mobileRepoUrl)}
          />
          <ListRow
            title="Repositorio Backend (GitHub)"
            subtitle="github.com/kencrisg/FindMyFamily.backend"
            icon={<Server size={20} color={colors.primary} />}
            onPress={() => void openExternalUrl(APP_INFO.backendRepoUrl)}
          />
          <ListRow
            title="Licencia de FindMyFamily"
            subtitle={`MIT License · © 2026 ${APP_INFO.authorHandle}`}
            icon={<Scale size={20} color={colors.secondary} />}
            trailing={<Badge label="MIT" tone="success" />}
            onPress={() => setSelectedLicense(APP_LICENSE_ENTRY)}
            isLast
          />
        </Section>

        <Section
          title="Licencias de código abierto"
          >
          {OPEN_SOURCE_LICENSES.map((item, index) => (
            <ListRow
              key={item.id}
              title={item.name}
              subtitle={item.subtitle}
              icon={<FileText size={20} color={colors.textSecondary} />}
              trailing={<Badge label={item.license} tone="neutral" />}
              onPress={() => setSelectedLicense(item)}
              isLast={index === OPEN_SOURCE_LICENSES.length - 1}
            />
          ))}
        </Section>
      </ScrollView>

      <LicenseModal
        item={selectedLicense}
        onClose={() => setSelectedLicense(null)}
        onOpenUrl={(url) => void openExternalUrl(url)}
      />
    </>
  );
};

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  appIcon: {
    width: 76,
    height: 76,
    borderRadius: 22,
    marginBottom: Spacing.md,
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  appIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  appName: {
    ...Typography.title1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  version: {
    ...Typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  description: {
    ...Typography.footnote,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    lineHeight: 19,
  },
}));
