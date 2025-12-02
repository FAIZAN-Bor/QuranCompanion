import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import home from '../home/home';
import SettingsScreen from '../DrawerScreen/SettingScreen';
import MistakeScreen from '../DrawerScreen/MistakeScreen';
import AnalyticsScreen from '../DrawerScreen/AnalyticsScreen';


import { Image } from 'react-native';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0A7D4F',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingVertical: 5, height: 60 },
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
        name="Mistake" 
        component={MistakeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../assests/mistake.png')} style={{ width: size, height: size, tintColor: color }} />
          )
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../assests/analysis.png')} style={{ width: size, height: size, tintColor: color }} />
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
