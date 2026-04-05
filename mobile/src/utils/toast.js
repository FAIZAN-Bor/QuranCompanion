import React from 'react';
import { Alert } from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const asText = (value, fallback = '') => {
  if (value == null) return fallback;
  const normalized = String(value).trim();
  return normalized || fallback;
};

const getToastTypeFromTitle = (title) => {
  const lower = asText(title).toLowerCase();

  if (
    lower.includes('error') ||
    lower.includes('failed') ||
    lower.includes('invalid') ||
    lower.includes('locked') ||
    lower.includes('issue')
  ) {
    return 'error';
  }

  if (
    lower.includes('success') ||
    lower.includes('complete') ||
    lower.includes('saved') ||
    lower.includes('updated')
  ) {
    return 'success';
  }

  return 'info';
};

export const showAppToast = ({
  type = 'info',
  title = 'Notice',
  message = '',
  duration = 2800,
}) => {
  Toast.show({
    type,
    text1: asText(title, 'Notice'),
    text2: asText(message),
    position: 'top',
    visibilityTime: duration,
    autoHide: true,
    topOffset: 52,
  });
};

export const showSuccess = (message, title = 'Success') => {
  showAppToast({ type: 'success', title, message });
};

export const showError = (message, title = 'Error') => {
  showAppToast({ type: 'error', title, message });
};

export const showInfo = (message, title = 'Notice') => {
  showAppToast({ type: 'info', title, message });
};

export const patchAlertToToast = () => {
  if (global.__QC_ALERT_TOAST_PATCHED__) return;

  const nativeAlert = Alert.alert.bind(Alert);

  Alert.alert = (title, message, buttons, options, type) => {
    if (Array.isArray(buttons) && buttons.length > 0) {
      return nativeAlert(title, message, buttons, options, type);
    }

    const hasSeparateMessage = message != null && String(message).trim() !== '';
    const toastTitle = hasSeparateMessage ? asText(title, 'Notice') : 'Notice';
    const toastMessage = hasSeparateMessage
      ? asText(message)
      : asText(title, 'Something happened');

    showAppToast({
      type: getToastTypeFromTitle(toastTitle),
      title: toastTitle,
      message: toastMessage,
    });

    return undefined;
  };

  global.alert = (message) => {
    showInfo(asText(message, 'Something happened'), 'Notice');
  };

  global.__QC_ALERT_TOAST_PATCHED__ = true;
};

const baseText1 = {
  fontSize: 15,
  fontWeight: '800',
};

const baseText2 = {
  fontSize: 13,
  fontWeight: '600',
};

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#0A7D4F',
        backgroundColor: '#F4FFF5',
        minHeight: 66,
        borderRadius: 14,
      }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ ...baseText1, color: '#065F46' }}
      text2Style={{ ...baseText2, color: '#14532D' }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#D32F2F',
        backgroundColor: '#FFF5F5',
        minHeight: 66,
        borderRadius: 14,
      }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ ...baseText1, color: '#991B1B' }}
      text2Style={{ ...baseText2, color: '#7F1D1D' }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#1976D2',
        backgroundColor: '#F3F9FF',
        minHeight: 66,
        borderRadius: 14,
      }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ ...baseText1, color: '#1E3A8A' }}
      text2Style={{ ...baseText2, color: '#1E40AF' }}
    />
  ),
};
