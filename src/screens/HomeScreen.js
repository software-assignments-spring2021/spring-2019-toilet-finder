import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Platform,
  TouchableOpacity } from 'react-native';
import { MapView, Marker } from "expo";
import { Constants, Location, Permissions } from 'expo';

var AWS = require('aws-sdk')

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
var creds = new AWS.CognitoIdentityCredentials({
	IdentityPoolId: 'us-east-1:e7994f82-231f-43db-9a9b-e1868280592f',
});

AWS.config.credentials = creds;

// database connection
var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

// test parameters for querying the database
var params = {
  ExpressionAttributeValues: {  // these are the expression used later
    ":loc": "loc"
  },
  KeyConditionExpression: "spec_type = :loc",  // expression used here for comparision with partition key
  TableName: 'toilets',  // name of the table to be queried
  IndexName: 'spec_type-index' // name of index for querying by datatype
};

// database query function passing in params to query by
// async function queryLocations() {
//   await ddb.query(params, function(err, data) {
//     if (err) {
//       console.log("Error", err);
//     } else {
//       console.log("Success", data);
//       return data
//     }
//   });
// }

markers = [{
  title: 'bathroom1',
  coordinates: {
    latitude: 40.76727216,
    longitude: -73.99392888,
  },
},
{
  title: 'bathroom2',
  coordinates: {
    latitude: 40.77,
    longitude: -73.99392888,
  },
}];

class HomeScreen extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      //State of the initial region
      region:{
        latitude: 40.76727216,
        longitude: -73.99392888,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      ready: true,
      location: null,
      errorMessage: null,
      //Locations of bathrooms to be stored
      markers: markers
    };
  }

/*
//Demo function for sorting by distance later
  sort(array){
    if (array.length === 0){
      return "There are no bathrooms near you";
    }
    array.sort(function(a, b){return a - b});
    return array;
  }
*/

  //Code being used for reac Native
  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Error with Android Emulator, try on your device',
      });
    } else {
      this._getLocationAsync();
    }
  }

  //Check if the component successfully mounted on DOM
  async componentDidMount() {
    //Make an error statement if the mounting has failed
    function errorAlert(err){
      alert(err);
    }

    // query the database for toilet locations
    await ddb.query(params, (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
        // set the list of markers in the state
        this.setState({markers: data.Items});
      }
    });

    navigator.geolocation.getCurrentPosition (
      //Get the user position
      (position) => {
        let userState = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          //Harcoded zoom in for the map
          latitudeDelta: 0.015,
          longitudeDelta: 0.015
        };
        //Update the map to the actual user latitude and longitude
        this.setState({region:userState});
        alert("latitude:" + this.state.region.latitude);
      },
      errorAlert,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000
      }
    );
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };

  render() {
    let text = "Loading";

    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location);
    }

    console.log(this.state.markers)
    // console.log(text);

    return (
      <View style={{flex:1}}>
        <MapView
          style={styles.map}
          key={this.state.forceRefresh}
          provider="google"
          //This part shows the user location with a blue marker
          region={this.state.region}
          showsUserLocation={true}
          //Initial region specified on the map
          initialRegion={{
            latitude: this.state.region.latitude,
            longitude: this.state.region.longitude,
            latitudeDelta: this.state.region.latitudeDelta,
            longitudeDelta: this.state.region.longitudeDelta,
          }}
        >
        {this.state.markers.map(marker => (
          <MapView.Marker
            coordinate={marker.coordinates}
            title={marker.title}
          />
        ))}
        </MapView>
        <Button
          onPress={() => {
            if (Location.hasServicesEnabledAsync())
              console.log(this.state.markers)
              Alert.alert(text);
          }}
          style={styles.findButton}
          title="Find The Nearest Bathroom"
          color="red"
        />
      </View>
    );
      }
}

const styles = StyleSheet.create({
  findButton: {
    // Add styles to the search button
  },
  map: {
    zIndex: -1,
    flex: 1
  },
});

// import React, { Component } from 'react';
// import {
// 	View,
// 	StyleSheet,
// 	Button,
// 	Alert,
//   Text,
//   Image,
//   AppRegistry
// } from 'react-native';

// class HomeScreen extends Component {
// 	//A function that simply pops up an alert upon clicking a button
//   _locationClick() {
//     Alert.alert('You are currently at ...')
//   }
//   _rankingClick() {
//     Alert.alert('Rank toilets by distance')
//   }

//   render() {
//     return (
//       <View style={styles.container}>
//         <ToiletImage />
//         <Text>Toilet Finder</Text>
//       	<View style={styles.buttonContainer}>
//           <Button
//             onPress={this._locationClick}
//             title="Current location"
//           />
//         </View>
//         <View style={styles.buttonContainer}>
//           <Button
//             onPress={this._rankingClick}
//             title="Toilets by distance"
//           />
//         </View>
//       </View>
//     );
//   }
// }

export default HomeScreen;

// const ToiletImage = () => (
//    <Image source = {require('./toilet.jpg')} />
// )

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonContainer: {
//     margin: 20
//   },
// });
