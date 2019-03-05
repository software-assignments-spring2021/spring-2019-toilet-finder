import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, createAppContainer} from 'react-navigation';

import HomeScreen from './screens/HomeScreen';
import AddLocationScreen from './screens/AddLocationScreen';

const BottomTabNavigator = createBottomTabNavigator({
  Home: { screen: HomeScreen },
  Add: { screen: AddLocationScreen },
});

const App = createAppContainer(BottomTabNavigator);

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
