import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import {
  createAppContainer,
  createStackNavigator,
} from 'react-navigation';

import "./global.js"
import HomeScreen from './screens/HomeScreen';
import AddLocationScreen from './screens/AddLocationScreen';
import MarkerInfo from './screens/MarkerInfo';

const AppNavigator = createStackNavigator({
    Home: { screen: HomeScreen },
    Add: { screen: AddLocationScreen },
    Info: { screen: MarkerInfo }
});

const App = createAppContainer(AppNavigator);

export default App;
