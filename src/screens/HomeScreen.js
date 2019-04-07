import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  Alert,
  Platform,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
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

class HomeScreen extends React.PureComponent {
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
      //parameter to prevent multiple renders
      isLoading: true,
      //Locations of bathrooms to be stored
      markers: [],
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
  handleMarkerPress(event) {
    const markerID = event.nativeEvent.id;
    console.log(markerID);
  }

  //Code being used for reac Native
  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.state.errorMessage = 'Error with Android Emulator, try on your device';
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
        // query the database for toilet locations
        ddb.query(params, (err, data) => {
          if (err) {
            console.log("Error", err);
          } else {
            // set the list of markers in the state and update map to user lat and long
            //this.state.markers = data.Items;
            //this.state.region = userState;
            this.setState({
              markers: data.Items,
              region:userState,
              isLoading:false
            });
          }
        });
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
      this.state.errorMessage = 'Permission to access location was denied';
    }
    let location = await Location.getCurrentPositionAsync({});
    this.state.location = location;
  };


  render() {
    let text = "Loading";

    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location);
    }
    console.log(this.state.markers)
    //Only render if isLoading is false, which occurrs inside componentDidMount
    if (this.state.isLoading == false){
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
            {this.state.markers.map((marker, index) => (
              <MapView.Marker
                key={marker.long_lat}
                coordinate={{latitude: marker.latitude, longitude: marker.longitude}}
                title={marker.name}
              >
              </MapView.Marker>
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
    else{
      return(
        <View style = {{justifyContent: 'center', alignItems: 'center', height:'100%', width:'100%'}}>
          <Image
            style = {styles.load}
            source={{uri: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif'}}
          />
        </View>
      )
    }
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
  load: {
    height: 200, 
    width: 200, 
  }
});

export default HomeScreen;