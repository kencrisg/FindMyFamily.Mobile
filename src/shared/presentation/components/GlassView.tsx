import React from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { makeStyles, useTheme } from '../../theme/use-theme';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  /** Si se omite, sigue el tema: material claro u oscuro. */
  tint?: 'light' | 'dark' | 'default' | 'systemThinMaterialLight' | 'systemThinMaterialDark';
  children: React.ReactNode;
}

export const GlassView: React.FC<GlassViewProps> = ({
  intensity = 80,
  tint,
  style,
  children,
  ...rest
}) => {
  const styles = useStyles();
  const { isDark } = useTheme();
  const resolvedTint = tint ?? (isDark ? 'systemThinMaterialDark' : 'systemThinMaterialLight');
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint={resolvedTint} style={[styles.blur, style]} {...rest}>
        {children}
      </BlurView>
    );
  }

  // High quality frosted simulation on Android
  return (
    <View style={[styles.androidGlass, style]} {...rest}>
      {children}
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  blur: {
    overflow: 'hidden',
    backgroundColor: colors.cardBackgroundGlass,
  },
  androidGlass: {
    backgroundColor: colors.sheetBackground,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    elevation: 8,
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
}));
