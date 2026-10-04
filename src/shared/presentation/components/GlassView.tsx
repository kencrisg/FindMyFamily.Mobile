import React from 'react';
import { StyleSheet, View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../theme/colors';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'systemThinMaterialLight';
  children: React.ReactNode;
}

export const GlassView: React.FC<GlassViewProps> = ({
  intensity = 80,
  tint = 'systemThinMaterialLight',
  style,
  children,
  ...rest
}) => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint={tint} style={[styles.blur, style]} {...rest}>
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

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  androidGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: Colors.borderSubtle,
    borderWidth: 1,
    elevation: 8,
    shadowColor: Colors.shadowElevated,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
});
