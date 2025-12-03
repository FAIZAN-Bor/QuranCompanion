import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from './auth/Splash';
import Onboarding from './auth/Onboarding';
import SignUp from './auth/SignUp';
import Login from './auth/Login';
import Otp from './auth/Otp';
import ForgetPassword from './auth/forgetPassword';

import DuaLearn from './home/DuaLearn';  
import Quran from './home/Quran'
import AllAya from './home/AllAya'
import AyaDetail from './home/AyaDetail';
import Quaida from './home/Quaida';
import QuidaTaqkti from './home/QuidaTaqkti';
import QuidaDetail from './home/QuidaDetail';
import NotificationScreen from './home/NotificationScreen';
import DrawerNavigator from './navigation/BottomTabNavigator';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import ChangPasswordScreen from './Setting/ChangePasswordScreen';
import EditProfile from './Setting/EditProfile';
import ParentNavigator from './parent/ParentNavigator';


const Stack = createNativeStackNavigator();

const navigation = () => {
  return (
     <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Splash" component={Splash} />
         <Stack.Screen name="Onboarding" component={Onboarding} /> 
          <Stack.Screen name="SignUp" component={SignUp} />
         <Stack.Screen name="Login" component={Login} /> 
            <Stack.Screen name="Otp" component={Otp} /> 
            <Stack.Screen name="ForgetPassword" component={ForgetPassword} /> 
                <Stack.Screen name="DuaLearn" component={DuaLearn}  options={{title:'Dua Screen',headerShown: true ,headerTintColor:'#2b624c'}}/> 
                <Stack.Screen name="Quran" component={Quran}options={{title:'Quran Screen',headerShown: true ,headerTintColor:'#2b624c'}} /> 
                <Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} />
                <Stack.Screen name="AllAya" component={AllAya} options={{title:'Quran Screen',headerShown: true ,headerTintColor:'#2b624c'}}/>
                <Stack.Screen name="AyaDetail" component={AyaDetail}  options={{title:'Quran Screen',headerShown: true ,headerTintColor:'#2b624c'}}/>
                 <Stack.Screen name="Quaida" component={Quaida} options={{title:'Quran Screen',headerShown: true ,headerTintColor:'#2b624c'}} />
                   <Stack.Screen name="QuidaTaqkti" component={QuidaTaqkti} options={{title:'Quran Screen',headerShown: true ,headerTintColor:'#2b624c'}}/>
                   <Stack.Screen name="QuidaDetail" component={QuidaDetail} />
                   <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{title:'Notifications',headerShown: true ,headerTintColor:'#2b624c'}}/>
      <Stack.Screen name="EditProfile" component={EditProfile} options={{title:'Edit Profile',headerShown: true ,headerTintColor:'#2b624c'}}/>
                     <Stack.Screen name="ChangPasswordScreen" component={ChangPasswordScreen} options={{title:'Notifications',headerShown: true ,headerTintColor:'#2b624c'}}/>
      
      {/* Parent Screens */}
      <Stack.Screen name="ParentNavigator" component={ParentNavigator} />
      
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default navigation

const styles = StyleSheet.create({})