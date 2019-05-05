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
import {
  getLocationData,
  getRatingData,
  getDescription
} from '../global.js'
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
// // unpacking variables to be stored in the DB
// var now = Date.now().toString();
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
//             	"comment": state.comment
//             }
//           }
//         },
//         {
//           PutRequest: {   // put ratings info
//             Item: {
// 							"longLat": this.params.longLat,
// 							"timestamp": addKey(now),
// 							"spec_type": "rating",
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
		upPressed: false,
		downPressed: false,
		liked: false,
		rating: '',
		description: '',
		comments: [],
		comment: ''
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

	updateUpvotes = () => {
	if (!this.state.upPressed) {
		if (!this.state.downPressed) {
			this.setState((prevState, props) => {
				return {
					upvote: prevState.upvote + 1,
					rating: (prevState.upvote + 1)/(prevState.upvote + prevState.downvote + 1),
					upPressed: true
				};
			});
		} else {
			this.setState((prevState, props) => {
				return {
					upvote: prevState.upvote + 1,
					downvote: prevState.downvote - 1,
					upPressed: true,
					downPressed: false,
					rating: (prevState.upvote + 1)/(prevState.upvote + prevState.downvote)
				};
			})
		}
	} else {
		return;
	}
}

updateDownvotes = () => {
	if (!this.state.downPressed) {
		if (!this.state.upPressed) {
			this.setState((prevState, props) => {
				return {
					downvote: prevState.downvote + 1,
					rating: (prevState.upvote)/(prevState.upvote + prevState.downvote + 1),
					downPressed: true
				};
			});
		} else {
			this.setState((prevState, props) => {
				return {
					upvote: prevState.upvote -1,
					downvote: prevState.downvote + 1,
					downPressed: true,
					upPressed: false,
					rating: (prevState.upvote - 1)/(prevState.upvote + prevState.downvote)
				}
			});
		}
	} else {
		return;
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
				this.setState({
					description: data.Items[0].desc
				})
			}
		});

		// query comments
		var paramCom = {
			TableName: "toilets",
			ExpressionAttributeNames: {
				"#comment": "comment"
			},
			ExpressionAttributeValues: {                  // set string for use in expressions
				":latLong": this.params.longLat,
				":spec": "comment"
			},
			KeyConditionExpression: "longLat = :latLong",  // partition key comparison
			FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
			ProjectionExpression: "#comment"
		};
		ddb.query(paramCom, (err, data) => {
			if (err) {
				console.log(err);
				return [];  // return empty array if no data so nothing breaks...
			} else {
				this.setState({
					comment: data.Items[0].comment,
				})
				this.comments.push(this.state.comment.toString());
			}
		});


		// query parameters
		var ratingParams = {
			TableName: "toilets",
			ExpressionAttributeValues: {                  // set string for use in expressions
				":latLong": this.params.longLat,
				":spec": "rating"
			},
			KeyConditionExpression: "longLat = :latLong",  // partition key comparison
			FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
			ProjectionExpression: "upvote, downvote"
		};

		ddb.query(ratingParams, (err, data) => {
			if (err) {
				console.log(err);
			} else {
				if (data.Count == 0) {
					this.setState({
						rating: 'No Rating'
					});
				}
				console.log(data);
			}
		});

		let longLat = this.params.longLat.split("+");
		let long = longLat[0];
		let lat = longLat[1];
		let destination = {lat, long};
		let userLat = this.props.navigation.state.params.userLat;
		let userLong = this.props.navigation.state.params.userLong;
		//Call function to get directions data to be navigated to
		this.getDirections(`${userLat}, ${userLong}`, `${lat}, ${long}`)
	}


	//On clicking navigate, change screens and show a polyline to guide user
	onNav = () => {
		//Calculate and change the latitude and longitude delta
		let longLat = this.params.longLat.split("+");
		let long = parseFloat(longLat[0]);
		let lat = parseFloat(longLat[1]);
		let longDelta = Math.abs(Math.abs(long) - Math.abs(this.props.navigation.state.params.userLong));
		let latDelta = Math.abs(Math.abs(lat) - Math.abs(this.props.navigation.state.params.userLat));
		//Claculate the mid-point of the 2 locations
		let middleLong = Math.abs(Math.abs(long) + Math.abs(this.props.navigation.state.params.userLong)) / 2;
		let middleLat = Math.abs(Math.abs(lat) + Math.abs(this.props.navigation.state.params.userLat)) / 2;
		//In case latitude and longitude were negative, multiple the calculated aboslute value by -1
		if (long < 0){
			middleLong = middleLong * -1;
		}
		if (lat < 0){
			middleLat = middleLat * -1;
		}
		this.props.navigation.navigate('Home', {
			coords: this.state.coords,
			newLat: latDelta + latDelta/10,
			newLong: longDelta + longDelta/10,
			midLat: middleLat,
			midLong: middleLong
		})
		//Set global variable to longLat of destination
		global.navigated = this.props.navigation.state.params.longLat;
		global.bit = 1;
	}

	//If user wants to quit the navigation
	onQuit = () => {
		//Reset the latLong data and delta data to user's actual location
		this.props.navigation.navigate('Home', {
			coords: [],
			newLat: 0.015,
			newLong: 0.015,
			midLat: this.props.navigation.state.params.userLat,
			midLong: this.props.navigation.state.params.userLong
		})
		//Set global variable back to 0
		global.navigated = 0;
	}

	render(){
		if (this.state.isLoading == false) {
			//Show the quit navigation button only when we are opening the marker for the location polyline is navigating to
			if (this.props.navigation.state.params.longLat === global.navigated){
				styles.quitButton = styles.permaNav;
				styles.navButton = styles.permaQuit;
			}
			else{
				styles.quitButton = styles.permaQuit;
				if (global.bit !== 0){
					styles.navButton = styles.permaNav;
				}
			}
			return(
				<Container style={{align: 'center', backgroundColor: '#fff5ef'}}>
					<Content>
						<View style={{flexDirection: "row", marginLeft: 20}}>
							<Text style={{fontWeight: 'bold', fontSize: 30, paddingBottom: 15, paddingTop: 15}}>{this.params.name}</Text>
							<View style={{flexDirection: 'column', justifyContent: 'flex-end'}}>
								<Button block light style={styles.navButton} onPress={this.onNav}>
									<Text>Navigate</Text>
								</Button>
								<Button block light style={styles.quitButton}onPress={this.onQuit}>
									<Text>Quit Navigation</Text>
								</Button>
							</View>
						</View>
						<Text style={{flex: 1, flexWrap: 'wrap', marginLeft: 20}}>{this.state.description}</Text>
						<View style={{flexDirection: "row", marginLeft: 20}}>
							<Text>Distance: {this.state.distance}</Text>
							<Text>ETA: {this.state.eta}</Text>
						</View>
						<ScrollView style={{marginLeft: 20, marginRight: 20}}>
							<Text style={{fontSize: 20}}>Rating</Text>
							<View style={{flexDirection: "row"}}>
								<Text style={styles.tags}>{this.state.baby.toString()}</Text>
								<Text style={styles.tags}>handi{this.state.disabled.toString()}</Text>
								<Text style={styles.tags}>pay{this.state.paytouse.toString()}</Text>
								<Text style={styles.tags}>unisex{this.state.unisex.toString()}</Text>
							</View>
							<View style={{
							    borderBottomColor: 'black',
							    borderBottomWidth: 1,
									paddingTop: 5
							  }}
							/>
							<Text>comments here</Text>
							<View style={{
							    borderBottomColor: 'black',
							    borderBottomWidth: 1,
									paddingTop: 5
							  }}
							/>
							<View>
								<Text>Used this toilet before? Leave a comment!</Text>
								<Text>Comment: </Text>
								<TextInput	//text input box for comment on location
									style={{height: 80, borderColor: 'gray', borderWidth: 1}}
									onChangeText={(text) => this.setState({comment: text})}
								/>
							</View>
							<View style={{flexDirection: "row", padding: 5, justifyContent: 'center'}}>
								<Button success onPress={this.updateUpvotes}>
									<Text> Upvote </Text>
								</Button>
								<Button danger onPress={this.updateDownvotes}>
									<Text> Downvote </Text>
								</Button>
							</View>
							<View style={{flexDirection: "row", paddingTop: 3, justifyContent: 'center'}}>
								<Button style={{alignItems: 'center'}} onPress = {()=>addReviewToDynamo(this.state)}>
								<Text style={{fontSize: 20}}>Submit</Text>
								</Button>
							</View>
						</ScrollView>
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
	comments: {
		flex: 1,
    margin: 20,
    backgroundColor: '#FFFCE9',
    margin: 10,
    textAlign: 'left',
    fontSize: 20,
    paddingTop: 70
	},
	tags: {
		flex: 1,
		margin: 5,
		backgroundColor: '#EFE1B0',
		textAlign: 'center',
		fontSize: 16,
		paddingTop: 20,
		borderColor: 'black'
	},
	load: {
		height: 200,
		width: 200,
	},
	navButton: {
		fontSize: 14,
		justifyContent: 'flex-end'
	},
	quitButton: {
		alignContent: 'center',
		marginTop: 15,
		display: 'none'
	},
	permaNav: {
		alignContent: 'center',
		marginTop: 15,
	},
	permaQuit: {
		alignContent: 'center',
		marginTop: 15,
		display: 'none'
	}
});
