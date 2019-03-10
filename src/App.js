var AWS = require('aws-sdk')

import { createBottomTabNavigator, createAppContainer} from 'react-navigation';

import HomeScreen from './screens/HomeScreen';
import AddLocationScreen from './screens/AddLocationScreen';

const BottomTabNavigator = createBottomTabNavigator({
  Home: { screen: HomeScreen },
  Add: { screen: AddLocationScreen },
});

const App = createAppContainer(BottomTabNavigator);

export default App;

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
var creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:e7994f82-231f-43db-9a9b-e1868280592f',
});

AWS.config.credentials = creds;

var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

// var params = {
//   TableName: "test",
//   Item: {
//     "item": "connection established"
//   }
// }

// dynamodb.putItem(params, (err, data) => {
//   if (err) {
//     console.error("Unable to add item. ");
//   } else {
//     console.log("Adding item:");
//   }
// })

ddb.listTables({Limit: 10}, function(err, data) {
  if (err) {
    console.log("Error", err.code);
  } else {
    console.log("Table names are ", data.TableNames);
  }
});


