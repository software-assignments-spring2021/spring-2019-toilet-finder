import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, createAppContainer} from 'react-navigation';

import HomeScreen from './screens/HomeScreen';
import AddLocationScreen from './screens/AddLocationScreen';

const BottomTabNavigator = createBottomTabNavigator({
  Home: { screen: HomeScreen },
  Add: { screen: AddLocationScreen },
  Map: { screen: Map },
});

const App = createAppContainer(BottomTabNavigator);

export default App;
