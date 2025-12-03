import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import ParentDashboard from './ParentDashboard';
import ChildProgressOverview from './ChildProgressOverview';
import ActivityTimeline from './ActivityTimeline';
import ParentProfile from './ParentProfile';

const Tab = createBottomTabNavigator();

const ParentBottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0A7D4F',
        tabBarInactiveTintColor: 'gray',
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
          marginBottom: 5,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={ParentDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assests/home.png')} 
              style={{ width: size, height: size, tintColor: color }} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ChildProgressOverview}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assests/analysis.png')} 
              style={{ width: size, height: size, tintColor: color }} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Activity" 
        component={ActivityTimeline}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assests/mistake.png')} 
              style={{ width: size, height: size, tintColor: color }} 
            />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ParentProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image 
              source={require('../assests/settings.png')} 
              style={{ width: size, height: size, tintColor: color }} 
            />
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default ParentBottomTabNavigator;
