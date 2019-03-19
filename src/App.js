import { createBottomTabNavigator, createAppContainer} from 'react-navigation';

import HomeScreen from './screens/HomeScreen';
import AddLocationScreen from './screens/AddLocationScreen';

const BottomTabNavigator = createBottomTabNavigator({
  Home: { screen: HomeScreen },
  Add: { screen: AddLocationScreen },
});

const App = createAppContainer(BottomTabNavigator);

export default App;

// var params = {
//   TableName: "test",
//   Item: {
//     "item": "connection established"
//   }
// }





