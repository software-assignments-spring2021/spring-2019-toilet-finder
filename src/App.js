import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import {
  createBottomTabNavigator,
  createAppContainer,
  createMaterialTopTabNavigator,
  createDrawerNavigator,
  DrawerItems
} from 'react-navigation';
import HomeScreen from './screens/HomeScreen';
import AddLocationScreen from './screens/AddLocationScreen';

// export default class App extends React.Component {
//   render() {
//     return (
//       <AppDrawerNavigator />
//     );
//   }
// }
//
// const CustomDrawerComponent = (props) => (
//   <SafeAreaView style={{flex:1}}>
//     <View style={{height: 150, backgrounColor: 'white'}}>
//     </View>
//     <ScrollView>
//       <DrawerItems {...props}/>
//     </ScrollView>
//   </SafeAreaView>
// )
//
// const AppDrawerNavigator = createDrawerNavigator({
//   Home: HomeScreen,
//   Add: AddLocationScreen
// }, {
//   contentComponent: CustomDrawerComponent
// })
const BottomTabNavigator = createBottomTabNavigator({
  Home: { screen: HomeScreen },
  Add: { screen: AddLocationScreen },
});

const App = createAppContainer(BottomTabNavigator);

export default App;
