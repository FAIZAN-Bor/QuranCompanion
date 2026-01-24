import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import home from '../home/home';
import SettingsScreen from '../DrawerScreen/SettingScreen';
import MistakeScreen from '../DrawerScreen/MistakeScreen';
import ProgressMap from '../home/ProgressMap';


import { Image } from 'react-native';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0A7D4F',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          paddingVertical: 5,
          height: 60,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={home} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../assests/home.png')} style={{ width: size, height: size, tintColor: color }} />
          )
        }}
      />
     
      <Tab.Screen 
        name="Progress Map" 
        component={ProgressMap} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../assests/analysis.png')} style={{ width: size, height: size, tintColor: color }} />
          )
        }}
      />
     
      <Tab.Screen 
        name="Mistake" 
        component={MistakeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../assests/mistake.png')} style={{ width: size, height: size, tintColor: color }} />
          )
        }}
      />
       <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../assests/settings.png')} style={{ width: size, height: size, tintColor: color }} />
          )
        }}
      />
    </Tab.Navigator>
  );
}
