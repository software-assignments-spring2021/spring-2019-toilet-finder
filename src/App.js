import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import {
  createAppContainer,
  createStackNavigator
} from 'react-navigation';
import HomeScreen from './screens/HomeScreen';
import AddLocationScreen from './screens/AddLocationScreen';

const AppNavigator = createStackNavigator({
    Home: { screen: HomeScreen },
    Add: { screen: AddLocationScreen },
});

const App = createAppContainer(AppNavigator);

export default App;
