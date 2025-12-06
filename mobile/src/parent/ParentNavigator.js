import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ParentBottomTabNavigator from './ParentBottomTabNavigator';
import LessonActivityDetails from './LessonActivityDetails';
import MistakeLog from './MistakeLog';
import QuizResults from './QuizResults';
import AchievementsRewards from './AchievementsRewards';

const Stack = createNativeStackNavigator();

const ParentNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ParentMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ParentMain" 
        component={ParentBottomTabNavigator}
        options={{ title: 'Parent' }}
      />
      <Stack.Screen 
        name="LessonActivityDetails" 
        component={LessonActivityDetails}
        options={{ title: 'Lesson Details' }}
      />
      <Stack.Screen 
        name="MistakeLog" 
        component={MistakeLog}
        options={{ title: 'Mistake Log' }}
      />
      <Stack.Screen 
        name="QuizResults" 
        component={QuizResults}
        options={{ title: 'Quiz Results' }}
      />
      <Stack.Screen 
        name="AchievementsRewards" 
        component={AchievementsRewards}
        options={{ title: 'Achievements' }}
      />
    </Stack.Navigator>
  );
};

export default ParentNavigator;
