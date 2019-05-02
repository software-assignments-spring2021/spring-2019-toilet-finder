import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, AsyncStorage, Image, TextInput } from 'react-native';
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

//For adding comment and rate to dynamodb
function addReviewToDynamo(state) {
//
// 	// unpacking variables to be stored in the DB
//   var now = Date.now().toString();
//
// 	var params = {
// 		RequestItems: {
// 			"toilets": [
//         {
//           PutRequest: {   // put user comments
//             Item: {
//               "longLat": this.params.longLat,
//               "timestamp": addKey(now),
//               "spec_type": "comment",
//               "comment": state.comment
//             }
//           }
//         },
//         {
//           PutRequest: {   // put ratings info
//             Item: {
//               "longLat": this.params.longLat,
//               "timestamp": addKey(now),
//               "spec_type": state.rating,
//               "upvote": state.upvote,
// 			        "downvote": state.downvote
//             }
//           }
// 				}
// 			]
// 		}
//   };
//
// 	// sending data to the database
// 	ddb.batchWrite(params, function(err, data) {
// 	  if (err) {
//       console.log("Error", err);
// 	  } else {
// 	    console.log("Data has been entered into ", data.TableNames);
// 	  }
// 	});
// }
//
// //Randomizer function to call when generating primary key
// function randomizer(){
// 	let val = Math.floor(Math.random() * Math.floor(10));
// 	val = val.toString();
// 	return val;
// }
//
// function addKey(str){
// 	let add = "-";
//   add = add.concat(randomizer());
//   add = add.concat(randomizer());
//   add = add.concat(randomizer());
//   add = add.concat(randomizer());
// 	let key = str.concat(add);
// 	return key;
}

// Builder design pattern
function tagBuilder() {
	return {
		isLoading: true,
		baby: false,
		disabled: false,
		paytouse: false,
		unisex: false,
		upvote: 0,
		downvote: 0,
		upchecked: false,
		downchecked: false
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
			var param = {
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
		ddb.query(param, (err, data) => {
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
		let longLat = this.params.longLat.split("+");
		let long = longLat[0];
		let lat = longLat[1];
		let destination = {lat, long};
		let userLat = this.props.navigation.state.params.userLat;
		let userLong = this.props.navigation.state.params.userLong;
		this.getDirections(`${userLat}, ${userLong}`, `${lat}, ${long}`)
	}

	upvotePress() {
		if (this.state.downchecked) {
			alert("Can't vote for both!")
		} else if (this.state.upchecked) {
			this.setState({
				upvote: this.state.upvote-1,
				upchecked:!this.state.upchecked
			});
		} else {
			this.setState({
				upvote: this.state.upvote+1,
				upchecked:!this.state.upchecked
			});
		}
	}
	downvotePress() {
		if (this.state.upchecked) {
			alert("Can't vote for both!")
		} else if (this.state.downchecked) {
			this.setState({
				downvote: this.state.downvote-1,
				downchecked:!this.state.downchecked
			});
		} else {
			this.setState({
				downvote: this.state.downvote+1,
				downchecked:!this.state.downchecked
			});
		}
	}

	render(){
		if (this.state.isLoading == false) {
			return(
				<Container style={{alignItems: 'center', backgroundColor: '#fff5ef'}}>
					<Text style={{fontWeight: 'bold', fontSize: 30, paddingBottom: 15, paddingTop: 15}}>{this.params.name}</Text>
					<Content>
						<Text style={{fontSize: 20, marginLeft: 60}}>Rating %</Text>
						<List>
							<ListItem>
								<Text>Baby: {this.state.baby.toString()}</Text>
							</ListItem>
							<ListItem>
								<Text>Disabled: {this.state.disabled.toString()}</Text>
							</ListItem>
							<ListItem>
								<Text>Pay to Use: {this.state.paytouse.toString()}</Text>
							</ListItem>
							<ListItem>
								<Text>Unisex: {this.state.unisex.toString()}</Text>
							</ListItem>
							<ListItem>
								<Button onPress={() => this.props.navigation.navigate('Home', {
									coords: this.state.coords
								})}>
									<Text>Navigate</Text>
								</Button>
							</ListItem>
						</List>
						<Text>Used this toilet before? Leave a review!</Text>
						<Text>Comments: </Text>
						<TextInput	//text input box for comment on location
							style={{height: 80, borderColor: 'gray', borderWidth: 1}}
							onChangeText={(text) => this.setState({comment: text})}
						/>
						<View style={{flexDirection: "row"}}>
							<Button disabled={this.state.upchecked} success style={{marginRight: 10}} onPress={()=>this.upvotePress()}><Text> Upvote </Text></Button>
							<Button disabled={this.state.downvoted} danger onPress={()=>this.downvotePress()}><Text> Downvote </Text></Button>
						</View>
						<Button style={{padding: 20}} onPress = {async () => {
		            addReviewToDynamo(this.state);
							}}>
						<Text>Submit</Text>
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
