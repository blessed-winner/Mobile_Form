import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type ContactPreference = 'email' | 'phone' | 'none';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  age: string;
  website: string;
  bio: string;
  experienceLevel: ExperienceLevel;
  newsletter: boolean;
  termsAccepted: boolean;
  notificationsEnabled: boolean;
  contactPreference: ContactPreference;
  favoriteTopics: string[];
  favoriteColor: string;
  photoUri?: string;
  submittedAt?: string;
}

const AVAILABLE_TOPICS = ['React Native', 'TypeScript', 'UI/UX Design', 'Backend APIs', 'Mobile Security'];
const COLOR_PALETTE = [
  '#3c87f7',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#6366f1',
];

function WebCameraFeed({ stream }: { stream: any }) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [stream]);

  return (
    <video
      id="web-camera-preview"
      ref={localVideoRef}
      autoPlay
      playsInline
      muted
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 10,
        transform: 'scaleX(-1)',
      }}
    />
  );
}

export default function FormScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    website: '',
    bio: '',
    experienceLevel: 'Intermediate',
    newsletter: true,
    termsAccepted: false,
    notificationsEnabled: false,
    contactPreference: 'email',
    favoriteTopics: ['React Native'],
    favoriteColor: '#3c87f7',
    photoUri: undefined,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submittedJson, setSubmittedJson] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<any>(null);
  const streamRef = useRef<any>(null);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTopic = (topic: string) => {
    setFormData((prev) => {
      const exists = prev.favoriteTopics.includes(topic);
      return {
        ...prev,
        favoriteTopics: exists
          ? prev.favoriteTopics.filter((t) => t !== topic)
          : [...prev.favoriteTopics, topic],
      };
    });
  };

  const startWebCamera = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        setIsCameraActive(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        streamRef.current = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error(err);
      setIsCameraActive(false);
      alert('Unable to access webcam. Please allow camera permissions.');
    }
  };

  const stopWebCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopWebCamera();
    };
  }, []);

  const captureWebSnapshot = () => {
    const video = document.getElementById('web-camera-preview') as HTMLVideoElement | null;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      updateField('photoUri', dataUrl);
      stopWebCamera();
    }
  };

  const handleOpenLiveCamera = async () => {
    if (Platform.OS === 'web') {
      await startWebCamera();
    } else {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera access is required to take a photo.');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          updateField('photoUri', result.assets[0].uri);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      submittedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(payload, null, 2);

    console.log('=== FORM SUBMITTED DATA (JSON) ===');
    console.log(jsonString);
    console.log('Parsed Object:', payload);
    setSubmittedJson(jsonString);

    if (Platform.OS === 'web') {
      alert('Form submitted successfully! Check browser devtools console.');
    } else {
      Alert.alert(
        'Form Submitted',
        'Payload has been printed to the console! See details below.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      website: '',
      bio: '',
      experienceLevel: 'Intermediate',
      newsletter: false,
      termsAccepted: false,
      notificationsEnabled: false,
      contactPreference: 'email',
      favoriteTopics: [],
      favoriteColor: '#3c87f7',
      photoUri: undefined,
    });
    setSubmittedJson(null);
    console.log('Form cleared');
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundElement,
      color: theme.text,
      borderColor: theme.backgroundSelected,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: Math.max(safeAreaInsets.top, Spacing.four),
            paddingBottom: safeAreaInsets.bottom + Spacing.five,
            paddingLeft: Math.max(safeAreaInsets.left, Spacing.three),
            paddingRight: Math.max(safeAreaInsets.right, Spacing.three),
          },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.maxWidthWrapper}>
          
          <View style={styles.header}>
            <ThemedText style={styles.title}>
              Registration Form
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Fill out the details below. All submitted inputs are serialized and logged as JSON.
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText type="smallBold" style={styles.sectionHeader}>
                PERSONAL INFORMATION
              </ThemedText>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Full Name</ThemedText>
              <TextInput
                style={inputStyle}
                placeholder="e.g. Jane Doe"
                placeholderTextColor={theme.textSecondary}
                value={formData.fullName}
                onChangeText={(text) => updateField('fullName', text)}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Email Address</ThemedText>
              <TextInput
                style={inputStyle}
                placeholder="jane@example.com"
                placeholderTextColor={theme.textSecondary}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Password</ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[inputStyle, styles.passwordInput]}
                  placeholder="Enter a secure password"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={({ pressed }) => [
                    styles.togglePasswordBtn,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.backgroundSelected,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <ThemedText type="small" style={styles.togglePasswordText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={[styles.fieldGroup, styles.flexOne]}>
                <ThemedText style={styles.fieldLabel}>Phone Number</ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.phone}
                  onChangeText={(text) => updateField('phone', text)}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>

              <View style={[styles.fieldGroup, styles.smallColumn]}>
                <ThemedText style={styles.fieldLabel}>Age</ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="25"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.age}
                  onChangeText={(text) => updateField('age', text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Website</ThemedText>
              <TextInput
                style={inputStyle}
                placeholder="https://example.com"
                placeholderTextColor={theme.textSecondary}
                value={formData.website}
                onChangeText={(text) => updateField('website', text)}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Bio / Notes</ThemedText>
              <TextInput
                style={[inputStyle, styles.textArea]}
                placeholder="Tell us a bit about yourself..."
                placeholderTextColor={theme.textSecondary}
                value={formData.bio}
                onChangeText={(text) => updateField('bio', text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText type="smallBold" style={styles.sectionHeader}>
                PREFERENCES & TOPICS
              </ThemedText>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Experience Level</ThemedText>
              <View style={styles.segmentedControl}>
                {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map((level) => {
                  const isSelected = formData.experienceLevel === level;
                  return (
                    <Pressable
                      key={level}
                      onPress={() => updateField('experienceLevel', level)}
                      style={[
                        styles.segmentButton,
                        isSelected && {
                          backgroundColor: theme.background,
                          borderColor: theme.backgroundSelected,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.08,
                          shadowRadius: 2,
                          elevation: 1,
                        },
                      ]}>
                      <ThemedText
                        type="small"
                        style={{
                          fontWeight: isSelected ? '600' : '400',
                          color: isSelected ? theme.text : theme.textSecondary,
                        }}>
                        {level}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Topics of Interest</ThemedText>
              <View style={styles.wrapContainer}>
                {AVAILABLE_TOPICS.map((topic) => {
                  const selected = formData.favoriteTopics.includes(topic);
                  return (
                    <Pressable
                      key={topic}
                      onPress={() => toggleTopic(topic)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? '#2563eb' : theme.background,
                          borderColor: selected ? '#2563eb' : theme.backgroundSelected,
                        },
                      ]}>
                      <ThemedText
                        type="small"
                        style={{
                          color: selected ? '#ffffff' : theme.text,
                          fontWeight: selected ? '600' : '400',
                          fontSize: 13,
                        }}>
                        {selected ? '✓ ' : '+ '}
                        {topic}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.switchDivider} />

            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <ThemedText style={styles.switchTitle}>Newsletter</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Receive product updates and announcements
                </ThemedText>
              </View>
              <Switch
                value={formData.newsletter}
                onValueChange={(val) => updateField('newsletter', val)}
                trackColor={{ false: theme.backgroundSelected, true: '#2563eb' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <ThemedText style={styles.switchTitle}>Push Notifications</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Get real-time alerts on your device
                </ThemedText>
              </View>
              <Switch
                value={formData.notificationsEnabled}
                onValueChange={(val) => updateField('notificationsEnabled', val)}
                trackColor={{ false: theme.backgroundSelected, true: '#2563eb' }}
              />
            </View>

            <View style={styles.switchDivider} />

            <Pressable
              onPress={() => updateField('termsAccepted', !formData.termsAccepted)}
              style={styles.checkboxRow}>
              <View
                style={[
                  styles.checkboxBox,
                  {
                    borderColor: formData.termsAccepted ? '#2563eb' : theme.textSecondary,
                    backgroundColor: formData.termsAccepted ? '#2563eb' : theme.background,
                  },
                ]}>
                {formData.termsAccepted && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </View>
              <ThemedText type="small" style={styles.checkboxLabel}>
                I accept the terms and conditions
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText type="smallBold" style={styles.sectionHeader}>
                APPEARANCE & PHOTO
              </ThemedText>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.colorHeaderRow}>
                <ThemedText style={styles.fieldLabel}>Accent Color</ThemedText>
                <View style={[styles.activeColorBadge, { backgroundColor: formData.favoriteColor }]}>
                  <ThemedText style={styles.activeColorText}>
                    {formData.favoriteColor.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.swatchesRow}>
                {COLOR_PALETTE.map((color) => {
                  const isSelected = formData.favoriteColor.toLowerCase() === color.toLowerCase();
                  return (
                    <Pressable
                      key={color}
                      onPress={() => updateField('favoriteColor', color)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        isSelected && styles.colorSwatchSelected,
                      ]}>
                      {isSelected && <ThemedText style={styles.swatchCheckmark}>✓</ThemedText>}
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                style={[inputStyle, styles.hexInput]}
                placeholder="#3C87F7"
                placeholderTextColor={theme.textSecondary}
                value={formData.favoriteColor}
                onChangeText={(text) => updateField('favoriteColor', text)}
                autoCapitalize="characters"
                maxLength={9}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Profile Photo</ThemedText>
              {formData.photoUri ? (
                <View style={styles.capturedPhotoContainer}>
                  <View style={styles.capturedThumbnailWrapper}>
                    <Image
                      source={{ uri: formData.photoUri }}
                      style={styles.capturedImage}
                      contentFit="cover"
                    />
                  </View>

                  <View style={styles.photoActions}>
                    <Pressable
                      onPress={handleOpenLiveCamera}
                      style={({ pressed }) => [
                        styles.secondaryActionButton,
                        {
                          backgroundColor: theme.background,
                          borderColor: theme.backgroundSelected,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}>
                      <ThemedText type="smallBold">Retake Photo</ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => updateField('photoUri', undefined)}
                      style={({ pressed }) => [
                        styles.removeActionButton,
                        { opacity: pressed ? 0.75 : 1 },
                      ]}>
                      <ThemedText type="smallBold" style={{ color: '#ef4444' }}>Remove</ThemedText>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.cameraButtonsRow}>
                  <Pressable
                    onPress={handleOpenLiveCamera}
                    style={({ pressed }) => [
                      styles.primaryCaptureBtn,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}>
                    <ThemedText style={styles.primaryCaptureBtnText}>
                      Take Photo
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          </ThemedView>

          <View style={styles.actionsContainer}>
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                { opacity: pressed ? 0.88 : 1 },
              ]}>
              <ThemedText style={styles.primaryButtonText}>
                Submit Form
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  borderColor: theme.backgroundSelected,
                  backgroundColor: theme.backgroundElement,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <ThemedText type="small" themeColor="textSecondary">
                Reset Form
              </ThemedText>
            </Pressable>
          </View>

          {submittedJson && (
            <ThemedView type="backgroundElement" style={styles.previewContainer}>
              <ThemedText type="smallBold" style={styles.previewTitle}>
                Submitted Payload (JSON)
              </ThemedText>
              <ThemedText type="code" style={styles.previewCode}>
                {submittedJson}
              </ThemedText>
            </ThemedView>
          )}
        </View>
      </ScrollView>

      {Platform.OS === 'web' && (
        <Modal
          visible={isCameraActive}
          transparent
          animationType="fade"
          onRequestClose={stopWebCamera}>
          <View style={styles.cameraModalBackdrop}>
            <View style={styles.cameraModalContent}>
              <View style={styles.cameraModalHeader}>
                <ThemedText type="subtitle">Live Camera</ThemedText>
                <Pressable onPress={stopWebCamera} hitSlop={12} style={styles.cameraCloseBtn}>
                  <ThemedText style={styles.cameraCloseText}>✕</ThemedText>
                </Pressable>
              </View>

              <View style={styles.videoContainer}>
                <WebCameraFeed stream={stream} />
              </View>

              <View style={styles.cameraControlsRow}>
                <Pressable
                  onPress={stopWebCamera}
                  style={[styles.cameraCancelBtn, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText type="smallBold">Cancel</ThemedText>
                </Pressable>

                <Pressable onPress={captureWebSnapshot} style={styles.cameraShutterBtn}>
                  <View style={styles.cameraShutterInner} />
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: 640,
    gap: Spacing.four,
  },
  header: {
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 14,
    padding: Spacing.four,
    gap: Spacing.three + 2,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.12)',
  },
  sectionHeaderRow: {
    paddingBottom: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  sectionHeader: {
    letterSpacing: 0.8,
    fontSize: 12,
    opacity: 0.7,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.85,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flexOne: {
    flex: 1,
  },
  smallColumn: {
    width: 90,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  passwordInput: {
    flex: 1,
  },
  togglePasswordBtn: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  togglePasswordText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
    padding: 4,
    borderRadius: 10,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: 2,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderRadius: 20,
  },
  switchDivider: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    marginVertical: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: Spacing.two,
    gap: 2,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 4,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
  },
  actionsContainer: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
  },
  previewTitle: {
    color: '#2563eb',
    fontSize: 13,
  },
  previewCode: {
    fontSize: 12,
    lineHeight: 18,
  },
  colorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeColorBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeColorText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  swatchesRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: Spacing.one,
  },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 2.5,
    borderColor: '#ffffff',
    transform: [{ scale: 1.12 }],
  },
  swatchCheckmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  hexInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
    marginTop: 4,
  },
  cameraButtonsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  primaryCaptureBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 11,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCaptureBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  capturedPhotoContainer: {
    gap: Spacing.two,
    marginTop: 2,
  },
  capturedThumbnailWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  photoActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  secondaryActionButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeActionButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  cameraModalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cameraModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCloseText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  videoContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#000000',
    borderRadius: 10,
    overflow: 'hidden',
  },
  cameraControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.one,
  },
  cameraCancelBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cameraShutterBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraShutterInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ef4444',
  },
});
