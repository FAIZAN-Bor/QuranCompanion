import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import Navigation from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';
import { patchAlertToToast, toastConfig } from './src/utils/toast';

const App = () => {
  useEffect(() => {
    patchAlertToToast();
  }, []);

  return (
    <AuthProvider>
      <Navigation />
      <Toast config={toastConfig} />
    </AuthProvider>
  );
};

export default App;