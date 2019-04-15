import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import {
  createAppContainer,
  // createStackNavigator
  createBottomTabNavigator
} from 'react-navigation';

import "./global.js"
import HomeScreen from './screens/HomeScreen';
import AddLocationScreen from './screens/AddLocationScreen';

const AppNavigator = createBottomTabNavigator({
    Home: { screen: HomeScreen },
    Add: { screen: AddLocationScreen },
});

const App = createAppContainer(AppNavigator);

export default App;
