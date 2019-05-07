import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Alert,
  Platform,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native';
import {
  Container,
  Header,
  Left,
  Button,
  Body,
  Text,
  Right,
  Icon,
  Item,
  Title,
  Drawer,
  Input,
  List,
  ListItem,
  Content
} from 'native-base';
import {
  Marker,
  Updates,
  Constants,
  Location,
  Permissions
} from "expo";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SearchBar } from "react-native-elements";
import MapView from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import getDirections from 'react-native-google-maps-directions';
import MapCallout from '../components/MapCallout';
import {
  getLocationData,
  getRatingData,
  getDescription
} from '../global.js'

var AWS = require('aws-sdk')
//Google Maps API key for navigation
const GOOGLE_MAPS_APIKEY = 'AIzaSyBXXzi2CvuVF1-ooO1-HZ-2TamYAYW-xSc';

// aws config using obtained credentials
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = global.creds;

// database connection
var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

// parameters for a location scan of the database
var params = {
  TableName: "toilets",
  ExpressionAttributeNames: {
    "#name": "name"
  },
  ExpressionAttributeValues: {                  // set string for use in expressions
    ":spec": "loc"
  },
  FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
  ProjectionExpression: "longLat, #name, longitude, latitude"
};

class HomeScreen extends React.Component {

  constructor(props){
    super(props);
    // this.params = this.props.navigation.state.params;
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
      continue: true,
      //Locations of bathrooms to be stored
      markers: [],
      //Current dummy Location
      currLat: 0,
      currLong: 0
    };
  }

  //An iterator that goes through the list of closest bathrooms. We run through them to make sure some of them have the tags user wants included
  iterator(){
    //Create an object
    let iterate = function(list){
      let i = 0;
      let items = list;
      this.i = 0;
      this.items = list;
    }

    iterate.prototype = {
      //Get current value
      getVal: function(){
        return this.items[this.i];
      },
      //Look at what the next closest toilet location is
      next: function(){
        this.i++;
        return this.items[this.i];
      },
      //Look at the previously closest toilet location
      prev: function(){
        this.i--;
        return this.items[this.i];
      }
    }
    //This function will be implemented once get the "find nearest locations" system to work
    /*
    function get(){
      let collection = [];
      let items = [1,2,3,4,5];
      let iter = new iterate(items);
      while (iter.items[iter.i] !== undefined){
        //Put it in a designated list that would be presented to the user... yet to be written
        collection.append(iter.items[i])
        iter.next();
      }
    }
    get();
    */
  }

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

  //Function to use for navigation
  async getDirections(startLoc, destinationLoc) {
  try {
    //Fetching the route from google maps api
    let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }&mode=walking&key=${ GOOGLE_MAPS_APIKEY }`)

    let respJson = await resp.json();
    respJson.routes[0].legs[0].steps[0].travel_mode = "WALKING";
    //The line that connects the locations
    let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
    let coords = points.map((point, index) => {
        return  {
            latitude : point[0],
            longitude : point[1]
        }
    })
    //Add the points we need to draw the polyline to state
    this.setState({coords: coords});
    }
    catch(error) {
      alert(error)
      return error
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
        ddb.scan(params, (err, data) => {
          if (err) {
            console.log("Error", err);
          } else {
            // set the list of markers in the state and update map to user lat and long
            this.setState({
              markers: data.Items,
              region:userState,
              isLoading:false
            });
          }
        });
        //Creates the line for navigation. It is here for now because the "navigate" button on a toilet screen is yet to be made. Guides to a Bobst location for now
        this.getDirections(`${userState.latitude}, ${userState.longitude}`, `${userState.latitude}, ${userState.longitude}`);
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

  closeDrawer(){
    this._drawer._root.close()
  };

  openDrawer(){
    this._drawer._root.open()
  };

  goToMarkerDetails = (location) => {
    this.props.navigator.push({

    })
  }

  static navigationOptions = {title: 'welcome', header: null};

  handleOnPressHome = () => {
    this.closeDrawer();
    this.props.navigation.navigate('Home')
  }

  handleOnPressAdd = () => {
    this.closeDrawer();
    this.props.navigation.navigate('Add')
  }

  handleOnPressSearch = () => {
    this.closeDrawer();
    this.props.navigation.navigate('Search')
  }

  render() {
    let text = "Loading";
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location);
    }
    //Only render if isLoading is false, which occurrs inside componentDidMount
    if (this.state.isLoading == false){
      //This indicates that the user is asking for a location to be navigated to
      if (this.props.navigation.state.params !== undefined){
        //Reset the value of latitude and longitude to actual user's location first
        this.state.region.latitude = this.state.currLat;
        this.state.region.longitude = this.state.currLong;
        //User has clicked navigation so adjust screen to show starting point and destination
        if (this.props.navigation.state.params.coords !== undefined){
          this.state.coords = this.props.navigation.state.params.coords;
          this.state.region.latitudeDelta = this.props.navigation.state.params.newLat;
          this.state.region.longitudeDelta = this.props.navigation.state.params.newLong;
          this.state.region.latitude = this.props.navigation.state.params.midLat;
          this.state.region.longitude = this.props.navigation.state.params.midLong;
        }
        //User has searched a location
        if (this.props.navigation.state.params.searchLat !== undefined){
          this.state.region.latitude = this.props.navigation.state.params.searchLat;
          this.state.region.longitude = this.props.navigation.state.params.searchLong;
          this.state.region.latitudeDelta = 0.015;
          this.state.region.longitudeDelta = 0.015;
          delete this.props.navigation.state.params.searchLat;
          delete this.props.navigation.state.params.searchLong;
        }
      }
      //User has not asked to change latitude or longitude data. Only enters on render at first
      else{
        this.state.currLat = this.state.region.latitude;
        this.state.currLong = this.state.region.longitude;
      }
      return (
        <Drawer
          ref={(ref) => {this._drawer = ref}}
          //This sets the content of the sidebar
          content={
            <Content style={{height: 70, paddingTop: 20, backgroundColor: 'white'}}>
              <List>
                <ListItem>
                  <Body>
                    <TouchableOpacity onPress={this.handleOnPressHome } >
                    <Text>Toilet Map</Text>
                    </TouchableOpacity>
                  </Body>
                  <Right>
                    <Icon type="Ionicons" name='map' style={{color: '#000000'}}/>
                  </Right>
                </ListItem>
                <ListItem>
                  <Body>
                  <TouchableOpacity onPress={this.handleOnPressAdd} >
                    <Text>Add Bathroom</Text>
                  </TouchableOpacity>
                  </Body>
                  <Right>
                    <Icon type="Ionicons" name='add' style={{color: '#000000'}}/>
                  </Right>
                </ListItem>
                <ListItem>
                  <Body>
                  <TouchableOpacity onPress={this.handleOnPressSearch} >
                    <Text>Search Location</Text>
                  </TouchableOpacity>
                  </Body>
                  <Right>
                    <Icon type="Ionicons" name='search' style={{color: '#000000'}}/>
                  </Right>
                </ListItem>
              </List>
            </Content>
          }
          onClose={() => this.closeDrawer()} >
        <Container style={{flex:1}}>
          <Header searchBar style={{backgroundColor: '#EFE1B0', height: 70, paddingTop: 20}}>
            <Left>
              <Button transparent onPress={()=> this.openDrawer()}>
              <Icon name="md-menu"  style={{color:'black'}} />
              </Button>
            </Left>
            <Body style={{paddingLeft:40}}>
              <Title style={{color:'black', fontWeight: 'bold'}}>Toilet Finder</Title>
            </Body>
          </Header>
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
                key={marker.longLat}
                coordinate={{latitude: marker.latitude, longitude: marker.longitude}}
              >
                <MapView.Callout
                  title={marker.name}
                  onPress={ () => this.props.navigation.navigate('Info', {
                    longLat: marker.longLat,
                    name: marker.name,
                    userLat: this.state.currLat,
                    userLong: this.state.currLong
                  })}

                >
                  <MapCallout
                    name = {marker.name}
                    longLat = {marker.longLat}
                  />
                </MapView.Callout>
              </MapView.Marker>
            ))}
             <MapView.Polyline
              coordinates={this.state.coords}
              strokeWidth={2}
              strokeColor="red"/>
          </MapView>
        </Container>
        </Drawer>
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
