import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, AsyncStorage, Image } from 'react-native';
import {
	Container,
	Header,
	Content,
	Button,
	Text,
	List,
	Icon,
	ListItem
} from 'native-base';
import Polyline from '@mapbox/polyline';
import getDirections from 'react-native-google-maps-directions';

var AWS = require('aws-sdk')

//Google Maps API key for navigation
const GOOGLE_MAPS_APIKEY = 'AIzaSyBXXzi2CvuVF1-ooO1-HZ-2TamYAYW-xSc';

// aws config using global obtained credentials
AWS.config.region = 'us-east-1';
AWS.config.credentials = global.creds;

//database connection
var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

// Builder design pattern
function tagBuilder() {
	return {
		isLoading: true,
		baby: false,
		disabled: false,
		paytouse: false,
		unisex: false,
		decription: ''
	}
}

export default class MarkerInfo extends React.Component {
	constructor(props) {
		super(props);
		this.params = this.props.navigation.state.params;
		this.state = tagBuilder();
	}

	static navigationOptions = {
		title: 'Location Information',
		headerStyle: {
			backgroundColor: '#EFE1B0'
		}
	};


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
    //This alerts the distance from current location to destination and ETA by walking
    alert("Distance: " + respJson.routes[0].legs[0].distance.text + "\n" + "ETA: " + respJson.routes[0].legs[0].duration.text);
    }
    catch(error) {
      alert(error)
      return error
  	}
  }

	componentDidMount() {
			// query parameters
			var paramTags = {
			TableName: "toilets",
			ExpressionAttributeValues: {                   // set string for use in expressions
				":latLong": this.params.longLat,
				":spec": "tag"
			},
			KeyConditionExpression: "longLat = :latLong",  // partition key comparison
			FilterExpression: "spec_type = :spec",         // filter my loc to get all locations
			ProjectionExpression: "baby, disabled, paytouse, unisex"
		};
		// query database
		ddb.query(paramTags, (err, data) => {
			if (err) {
				console.log(err);
				return [];  // return empty array if no data so nothing breaks...
			} else {
				this.setState({
					isLoading: false,
					baby: data.Items[0].baby,
					disabled: data.Items[0].disabled,
					paytouse: data.Items[0].paytouse,
					unisex: data.Items[0].unisex
				});
			}
		});

		var paramDesc = {
	    TableName: "toilets",
	    ExpressionAttributeNames: {
	      "#desc": "desc"
	    },
	    ExpressionAttributeValues: {                  // set string for use in expressions
	      ":latLong": this.params.longLat,
	      ":spec": "desc"
	    },
	    KeyConditionExpression: "longLat = :latLong",  // partition key comparison
	    FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
	    ProjectionExpression: "#desc"
	  };

		ddb.query(paramDesc, (err, data) => {
			if (err) {
				console.log(err);
				return [];  // return empty array if no data so nothing breaks...
			} else {
				console.log("DESCCRIPTION", data);
				this.setState({
					description: data.Items[0].desc
				})
			}
		});
		let longLat = this.params.longLat.split("+");
		let long = longLat[0];
		let lat = longLat[1];
		let destination = {lat, long};
		let userLat = this.props.navigation.state.params.userLat;
		let userLong = this.props.navigation.state.params.userLong;
		this.getDirections(`${userLat}, ${userLong}`, `${lat}, ${long}`)
	}

	checkIcons(state) {
		if (state == false) {
			return <Icon type="FontAwesome" name='remove' />
		} else {
			return <Icon type="FontAwesome" name='check' />
		}
	}

	render(){
		if (this.state.isLoading == false) {
			return(
				<Container style={{alignItems: 'center', backgroundColor: '#fff5ef'}}>
					<Text style={{fontWeight: 'bold', fontSize: 30, paddingBottom: 15, paddingTop: 15}}>Bathroom: {this.params.name}</Text>
					<Content>
						<Text>Description: {this.state.description}</Text>
						<Text style={{fontSize: 20, marginLeft: 60, marginTop: 25}}>Rating %</Text>
						<View
						  style={{
						    borderBottomColor: 'black',
						    borderBottomWidth: 1,
								marginBottom: 15,
								flex: 2
						  }}
						/>
						<View style={{flexDirection: "row"}}>
							<Button small success style={{marginRight: 10}}><Text> Upvote </Text></Button>
							<Button small danger><Text> Downvote </Text></Button>
						</View>
						<View
						  style={{
						    borderBottomColor: 'black',
						    borderBottomWidth: 1,
								marginTop: 15,
								marginBottom: 15,
								flex: 2
						  }}
						/>
								<Text>Baby: {this.checkIcons(this.state.baby)}</Text>
								<Text>Disabled: {this.checkIcons(this.state.disabled)}</Text>
								<Text>Pay to Use: {this.checkIcons(this.state.paytouse)}</Text>
								<Text>Unisex: {this.checkIcons(this.state.unisex)}</Text>
								<Button block light style={{alignContent: 'center', marginTop: 15}}onPress={() => this.props.navigation.navigate('Home', {
									coords: this.state.coords
								})}>
									<Text>Navigate</Text>
								</Button>
					</Content>
				</Container>
			);
		} else {
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
	load: {
		height: 200,
		width: 200,
	}
});
