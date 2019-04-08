import {
  createBottomTabNavigator,
  createAppContainer,
  createMaterialTopTabNavigator
} from 'react-navigation';

import HomeScreen from './screens/HomeScreen';
import AddLocationScreen from './screens/AddLocationScreen';

const AppNavigator = createMaterialTopTabNavigator(
  {
  Home: { screen: HomeScreen },
  Add: { screen: AddLocationScreen },
},
{
  tabBarOptions: {

    style: {
      color: 'red',
    }
  }
}

);



const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
