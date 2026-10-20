import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Image, ImageProps } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export interface ImageModalProps {
  visible: boolean;
  onClose: () => void;
  source?: ImageProps['source'];
  caption?: string;
}

export function ImageModal({
  visible,
  onClose,
  source,
  caption,
}: ImageModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close image preview backdrop"
        />
        <View
          style={[
            styles.contentContainer,
            {
              paddingTop: Math.max(insets.top, Spacing.four),
              paddingBottom: Math.max(insets.bottom, Spacing.four),
            },
          ]}
          pointerEvents="box-none">
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <ThemedText style={styles.closeText}>✕</ThemedText>
          </Pressable>
          <View style={styles.imageWrapper}>
            {source ? (
              <Image
                source={source}
                style={styles.image}
                contentFit="contain"
                transition={250}
              />
            ) : null}
          </View>
          {caption ? (
            <View style={styles.captionContainer}>
              <ThemedText style={styles.captionText}>{caption}</ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  imageWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: 500,
    maxHeight: 500,
  },
  captionContainer: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: Spacing.two,
  },
  captionText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
});
