import React from 'react';
import { 
	StyleSheet, 
	View, 
	TouchableOpacity, 
	SafeAreaView, 
	ScrollView, 
	Dimensions, 
	AsyncStorage, 
	Image, 
	TextInput, 
	Alert,
	FlatList 
} from 'react-native';
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

//Randomizer function to call when generating primary key
function randomizer(){
	let val = Math.floor(Math.random() * Math.floor(10));
	val = val.toString();
	return val;
}

function addKey(str){
	let add = "-";
  add = add.concat(randomizer());
  add = add.concat(randomizer());
  add = add.concat(randomizer());
  add = add.concat(randomizer());
	let key = str.concat(add);
	return key;
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
		comment: '',
		longLat: '',
		timestamp: ''
	}
}

export default class MarkerInfo extends React.Component {
	constructor(props) {
		super(props);
		this.params = this.props.navigation.state.params;
		this.state = tagBuilder();
		this.state.longLat = this.params.longLat;
	}

	static navigationOptions = {
		title: 'Location Information',
		headerStyle: {
			backgroundColor: '#EFE1B0'
		}
	};

	writeComment = () => {
		// unpacking variables to be stored in the DB
		var now = Date.now().toString();

		var params = {
			TableName: "toilets",
			Item: {
				"longLat": this.params.longLat,
				"timestamp": addKey(now),
				"spec_type": "comment",
				"comment": this.state.comment
			}	
		};

		// sending data to the database
		ddb.put(params, function(err, data) {
			if (err) {
				console.log("Error", err);
			} else {
				Alert.alert("Success! Comment has been added to location.");
			}
		});
	}

	// function handles upvote button presses
	updateUpvotes = () => {
		if (!this.state.upPressed) {							// if the upvote button hasn't been pressed yet
			if (!this.state.downPressed) {					// if the downvote button hasn't been pressed yet
				this.setState((prevState, props) => {
					return {
						upvote: prevState.upvote + 1,
						rating: (((prevState.upvote + 1)/(prevState.upvote + prevState.downvote + 1))*100).toFixed(2),
						upPressed: true
					};
				});
			} else {																// if the downvote button was pressed before
				this.setState((prevState, props) => {
					return {
						upvote: prevState.upvote + 1,
						downvote: prevState.downvote - 1,
						upPressed: true,
						downPressed: false,
						rating: (((prevState.upvote + 1)/(prevState.upvote + prevState.downvote))*100).toFixed(2)
					};
				})
			}
		} else {	// if the upvote button is already pressed do nothing
			return;
		}
	}

	// logic similar to upvote handler
	updateDownvotes = () => {
		if (!this.state.downPressed) {
			if (!this.state.upPressed) {
				this.setState((prevState, props) => {
					return {
						downvote: prevState.downvote + 1,
						rating: (((prevState.upvote)/(prevState.upvote + prevState.downvote + 1))*100).toFixed(2),
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
						rating: (((prevState.upvote - 1)/(prevState.upvote + prevState.downvote))*100).toFixed(2)
					}
				});
			}
		} else {
			return;
		}
	}

	// rate button handler
	rateButtonPress = () => {
		if ((this.state.upvote + this.state.downvote) > 1) {				// if there was already ratings data before
			var params = {
				TableName: 'toilets',
				Key: {
					'longLat': this.params.longLat,
					'timestamp': this.state.timestamp
				},
				UpdateExpression: 'set upvote = :up, downvote = :down',
				ExpressionAttributeValues: {
					':up': this.state.upvote,
					':down': this.state.downvote
				}
			}

			ddb.update(params, (err, data) => {			// update the database
				if (err) {
					console.log(err)
					Alert.alert('Rating was not successful.')
				} else {
					Alert.alert('Thank you for rating!')
				}
			})
		} else {														// if there was no ratings data before
			var now = Date.now().toString()
			var params = {
				TableName: 'toilets',
				Item: {
					'longLat': this.params.longLat,
					'timestamp': addKey(now),
					'spec_type': 'rating',
					'upvote': this.state.upvote,
					'downvote': this.state.downvote
				}
			}

			ddb.put(params, (err, data) => {	// enter a new ratings entry
				if (err) {
					console.log(err)
					Alert.alert('Rating was not successfull.')
				} else {
					Alert.alert('Thank you for rating!')
				}
			})
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
	    //Add the points, distance, and ETA for work
	    this.setState({coords: coords});
	    this.setState({distance: respJson.routes[0].legs[0].distance.text});
	    this.setState({eta: respJson.routes[0].legs[0].duration.text});
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
				if (data.Count == 0) {
					return;
				} else {
					this.setState({
						comments: data.Items,
					})
						// this.state.comments.push(this.state.comment.toString());
				}
			}
		});

		// query parameters
		var ratingParams = {
			TableName: "toilets",
			ExpressionAttributeValues: {                  // set string for use in expressions
				":latLong": this.params.longLat,
				":spec": "rating"
			},
			ExpressionAttributeNames: {
				"#time": "timestamp"
			},
			KeyConditionExpression: "longLat = :latLong",  // partition key comparison
			FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
			ProjectionExpression: "#time, upvote, downvote"
		};

		// query for the ratings data
		ddb.query(ratingParams, (err, data) => {
			if (err) {
				console.log(err);
			} else {
				if (data.Count == 0) {		// count of 0 means no data
					this.setState({
						rating: 'No Rating'
					});
				} else {
					if ((data.Items[0].upvote + data.Items[0].downvote) == 0) {
						this.setState({					// set states with old data
							upvote: data.Items[0].upvote,
							downvote: data.Items[0].downvote,
							timestamp: data.Items[0].timestamp,
							rating: 'No Rating'
						});
					} else {
						this.setState({					// set states with old data
							upvote: data.Items[0].upvote,
							downvote: data.Items[0].downvote,
							timestamp: data.Items[0].timestamp,
							rating: ((data.Items[0].upvote/(data.Items[0].upvote + data.Items[0].downvote))*100).toFixed(2)
						});
					}
				};
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

	getStyleBaby() {
		if (this.state.baby) {
			return styles.tags;
		} else {
			return styles.tagsFalse;
		}
	}
	getStyleDisabled() {
		if (this.state.disabled) {
			return styles.tags;
		} else {
			return styles.tagsFalse;
		}
	}
	getStylePay() {
		if (this.state.paytouse) {
			return styles.tags;
		} else {
			return styles.tagsFalse;
		}
	}
	getStyleUnisex() {
		if (this.state.unisex) {
			return styles.tags;
		} else {
			return styles.tagsFalse;
		}
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
						<View style={{flex: 1, flexDirection: "row", marginLeft: 20, marginRight: 20}}>
							<Text style={{flex: 2, fontWeight: 'bold', fontSize: 30, paddingTop: 15}}>{this.params.name}</Text>
							<View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', width: '25%'}}>
								<Button block light style={styles.navButton}onPress={this.onNav}>
									<Text>Navigate</Text>
								</Button>
								<Button block light style={styles.quitButton}onPress={this.onQuit}>
									<Text>Quit</Text>
								</Button>
							</View>
						</View>
						<Text style={{fontSize: 20, marginLeft: 20}}>{this.state.rating} %</Text>
						<View style={{flexDirection: "row", padding: 5, justifyContent: 'center'}}>
							<Button small success onPress={this.updateUpvotes}>
								<Text> Upvote </Text>
							</Button>
							<Button small style={{marginLeft: 3}} danger onPress={this.updateDownvotes}>
								<Text> Downvote </Text>
							</Button>
							<Button small style={{marginLeft: 3}} onPress={this.rateButtonPress}>
								<Text>Rate!</Text>
							</Button>
						</View>
						<View style={{flexDirection: "row", marginLeft: 20, marginRight: 20}}>
							<View style={{width: '50%'}}>
								<Text>Distance: {this.state.distance}</Text>
							</View>
							<View style={{width: '50%'}}>
								<Text>ETA: {this.state.eta}</Text>
							</View>
						</View>
						<ScrollView style={{marginLeft: 20, marginRight: 20}}>
							<Text style={{flex: 1, flexWrap: 'wrap', paddingTop: 10}}>{this.state.description}</Text>
							<View style={{flexDirection: "row"}}>
								<Text style={this.getStyleBaby()}> Baby </Text>
								<Text style={this.getStyleDisabled()}> Handicap </Text>
								<Text style={this.getStylePay()}> Pay to Use </Text>
								<Text style={this.getStyleUnisex()}> Unisex </Text>
							</View>
							<View style={{
							    borderBottomColor: 'black',
							    borderBottomWidth: 1,
									paddingTop: 5
							  }}
							/>
							<FlatList
								data={this.state.comments}
								renderItem={({item}) => <Text>{item.comment}</Text>}
							/>
							<View style={{
							    borderBottomColor: 'black',
							    borderBottomWidth: 1,
									paddingTop: 5
							  }}
							/>
							<View style={{paddingTop: 5}}>
								<Text>Used this toilet before? Leave a comment!</Text>
								<Text>Comment: </Text>
								<TextInput	//text input box for comment on location
									style={{height: 80, borderColor: 'gray', borderWidth: 1}}
									onChangeText={(text) => this.setState({comment: text})}
								/>
							</View>
							<View style={{flexDirection: "row", paddingTop: 3, justifyContent: 'center'}}>
								<Button style={{alignItems: 'center'}} onPress = {this.writeComment}>
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
	tagsFalse: {
		margin: 5,
		fontSize: 16,
		backgroundColor: '#FFD7D7',
		textAlign: 'center',
		borderColor: 'black',
		marginBottom: 14,
		borderWidth: 1,
		height: 35
	},
	tags: {
		margin: 5,
		backgroundColor: '#E0F6DC',
		textAlign: 'center',
		fontSize: 16,
		height: 35,
		marginBottom: 14,
		borderColor: 'black',
		borderWidth: 1
	},
	load: {
		height: 200,
		width: 200
	},
	navButton: {
		fontSize: 15,
		marginTop: 15,
	},
	quitButton: {
		marginTop: 15,
		display: 'none'
	},
	permaNav: {
		marginTop: 15,
	},
	permaQuit: {
		marginTop: 15,
		display: 'none'
	}
});
