import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Navigation from './src/navigation'
import { AuthProvider } from './src/context/AuthContext'

const App= () => {
  return (
    <AuthProvider>
      <Navigation/>
    </AuthProvider>
  )
}

export default App

const styles = StyleSheet.create({})