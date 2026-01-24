// QuranCompanion Mobile App - Unified Theme Constants
// Use these constants across all screens for consistent styling

export const COLORS = {
  // Primary Colors
  primary: '#0A7D4F',
  primaryLight: '#0F9D63',
  primaryLighter: '#15B872',
  
  // Background Colors
  background: '#F4FFF5',
  backgroundLight: '#E8F5E9',
  backgroundAccent: '#F1F8E9',
  cardBackground: '#FFFFFF',
  inputBackground: '#FAFAFA',
  
  // Text Colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  textPlaceholder: '#6C8A7A',
  textWhite: '#FFFFFF',
  textLink: '#0A7D4F',
  
  // Status Colors
  error: '#E53935',
  warning: '#FFA726',
  success: '#15B872',
  info: '#1976D2',
  
  // Border Colors
  borderLight: '#E8F5E9',
  borderMedium: '#E0E0E0',
  borderFocus: '#0A7D4F',
  
  // Accent Colors
  accentYellow: '#FFF9C4',
  accentYellowDark: '#FFF59D',
  accentGold: '#F57F17',
  
  // Shadow Colors
  shadowPrimary: '#0A7D4F',
  shadowDark: '#000000',
  
  // Tab/Navigation
  tabActive: '#0A7D4F',
  tabInactive: '#9E9E9E',
};

export const GRADIENTS = {
  // Page Background Gradients
  authBackground: ['#E8F5E9', '#F1F8E9', '#FFF9C4'],
  contentBackground: ['#F4FFF5', '#E8F5E9'],
  splashBackground: ['#0A7D4F', '#0F9D63', '#15B872', '#1ED760'],
  
  // Button Gradients
  primaryButton: ['#0A7D4F', '#0F9D63', '#15B872'],
  primaryButtonShort: ['#0A7D4F', '#15B872'],
  
  // Card Gradients
  cardLight: ['#FFFFFF', '#E8F5E9'],
  cardLighter: ['#FFFFFF', '#F1F8E9'],
  cardAccent: ['#FFFFFF', '#F0FDF4'],
  
  // Header Gradients
  header: ['#0A7D4F', '#0F9D63', '#15B872'],
  
  // Welcome Banner
  welcomeBanner: ['#FFF9C4', '#FFF59D'],
  
  // Settings Options
  settingsOption: ['#FFFFFF', '#E8F5E9'],
};

export const SHADOWS = {
  // Card Shadow
  card: {
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  // Container Shadow (heavy)
  container: {
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  
  // Button Shadow
  button: {
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Header Shadow
  header: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  
  // Tab Bar Shadow
  tabBar: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
};

export const TYPOGRAPHY = {
  // Title Styles
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  titleLarge: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  
  // Subtitle Styles
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  
  // Body Text
  body: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  
  // Button Text
  button: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.textWhite,
  },
  buttonSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  
  // Error Text
  error: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
  
  // Link Text
  link: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  
  // Section Header
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  
  // Card Title
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
};

export const SPACING = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 25,
  xxl: 30,
  xxxl: 40,
};

export const BORDER_RADIUS = {
  sm: 10,
  md: 15,
  lg: 20,
  xl: 25,
  xxl: 30,
  round: 50,
  circle: 100,
};

export const INPUT_STYLES = {
  // Standard Text Input
  input: {
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.inputBackground,
    padding: 15,
    borderRadius: BORDER_RADIUS.md,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    elevation: 2,
  },
  
  // Password Input Container
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.inputBackground,
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
  },
  
  // Password Input Field
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Eye Icon Button
  eyeIcon: {
    paddingHorizontal: 15,
  },
};

export const BUTTON_STYLES = {
  // Primary Button
  primary: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  
  // Secondary Button
  secondary: {
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
  },
};

export const CONTAINER_STYLES = {
  // Auth Card Container
  authCard: {
    width: '90%',
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xxl,
    ...SHADOWS.container,
  },
  
  // Screen Container
  screen: {
    flex: 1,
    padding: SPACING.lg,
  },
  
  // Content Container with bottom padding
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
};

export const TAB_BAR_STYLES = {
  tabBarActiveTintColor: COLORS.tabActive,
  tabBarInactiveTintColor: COLORS.tabInactive,
  tabBarStyle: {
    paddingVertical: 5,
    height: 60,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    ...SHADOWS.tabBar,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
  },
};

// Common screen options
export const SCREEN_OPTIONS = {
  headerShown: false,
};

export default {
  COLORS,
  GRADIENTS,
  SHADOWS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  INPUT_STYLES,
  BUTTON_STYLES,
  CONTAINER_STYLES,
  TAB_BAR_STYLES,
  SCREEN_OPTIONS,
};
