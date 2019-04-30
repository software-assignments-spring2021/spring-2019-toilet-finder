import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	TextInput,
	Alert,
	TouchableOpacity,
  TouchableHighlight
} from 'react-native';
import {
  Container,
  Body,
  Icon,
	Item,
	Input,
  Title,
	Text,
	Button,
	CheckBox,
  List,
  ListItem,
  Content,
	Form
} from 'native-base';
import { Constants, MapView, Location, Permissions, Updates} from 'expo';

var AWS = require('aws-sdk')

// aws config using global obtained credentials
AWS.config.region = 'us-east-1';
AWS.config.credentials = global.creds;

//database connection
var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});


//Adds a location to dynamodb using given data passed in
function addLocationToDynamo(state) {

	// unpacking variables to be stored in the DB
  var now = Date.now().toString();
  var longLat = longLatToString(state.location['coords']['longitude'], state.location['coords']['latitude']);
  var longitude = state.location['coords']['longitude'];
  var latitude = state.location['coords']['latitude'];

  /*
		parameters to be entered into the database
		RequestItems: {
      "TABLE_NAME": [
        ARRAY_OF_REQUESTS
        {
          PutRequest: {
            Item: {
              "long_lat": PARTITION_KEY (REQUIRED)
              "spec_type": SORT_KEY (REQUIRED)
              other attributed depend on the spec_type
            }
          }
        },
        {
          make multiple putrequests by adding another object
        }
      ]
    }
  */
	var params = {
		RequestItems: {
			"toilets": [
				{
					PutRequest: {   // put longitude latitude info
						Item: {
              "longLat": longLat,
              "timestamp": addKey(now),
              "spec_type": state.loc,
              "name": state.name,
              "longitude": longitude,
              "latitude": latitude
            }
          }
        },
        {
          PutRequest: {   // put user description
            Item: {
              "longLat": longLat,
              "timestamp": addKey(now),
              "spec_type": state.description,
              "desc": state.desc
            }
          }
        },
        {
          PutRequest: {   // put tag info
            Item: {
              "longLat": longLat,
              "timestamp": addKey(now),
              "spec_type": state.tag,
              "unisex": state.unisex,
              "disabled": state.disabled,
              "baby": state.baby,
              "paytouse": state.payToUse
            }
          }
        }
			]
		}
  };

	// sending data to the database
	ddb.batchWrite(params, function(err, data) {
	  if (err) {
      console.log("Error", err);
			Alert.alert("Error, unable to submit location.");
	  } else {
	    console.log("Data has been entered into ", data.TableNames);
			Alert.alert("Success! location has been added.");
			setTimeout(function() { Updates.reloadFromCache(); }, 1000);
	  }
	});
}

//Randomizer function to call when generating primary key
function randomizer(){
	let val = Math.floor(Math.random() * Math.floor(10));
	val = val.toString();
	return val;
}

function addKey(str){
	//Should randomize more after discussing with the team
	let add = "-";
  add = add.concat(randomizer());
  add = add.concat(randomizer());
  add = add.concat(randomizer());
  add = add.concat(randomizer());
	let key = str.concat(add);
	return key;
}

export function longLatToString(long, lat) {
	var longString = long.toString();
	var latString = lat.toString();
	let str = longString + "+" + latString;

	return str;
}

export default class AddLocationScreen extends Component {


	//user data to be sent to the database
	constructor(props){
		super(props);
		this.state = {
      name: '',
      desc: '',
			long_lat: '',
			location: null,
			errorMessage: null,
			loc: "loc",
			tag: "tag",
      review: "review",
      description: "desc",
      rating: "rating",
			unisex: false,
			baby: false,
			disabled: false,
			payToUse: false,
		};
	}

	static navigationOptions = {
		title: 'Add Location',
		headerStyle: {
			backgroundColor: '#EFE1B0'
		}
	};

	//function to get the user's location data
	_getLocationAsync = async () => {

		//making sure to get user permission first
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
		if (status !== 'granted') {
			this.setState({
				errorMessage: 'Permission to access location was denied',
			});
		}
    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
	};

	goToMarkerDetails = (location) => {
		this.props.navigator.push({
		})
	}

	handleOnPressHome = () => {
		this.props.navigation.navigate('Home')
	}

	handleOnPressAdd = () => {
		this.props.navigation.navigate('Add')
	}

	//rendering of the app screen
	render() {
		return (
			<Container style={{flex:1, backgroundColor: '#fff5ef'}}>
			<View style={{paddingTop: 10, flexDirection: 'column'}}>
				<Form>
				<Item>
          <Input placeholder="Enter a Location Name Here"
					onChangeText={(text) => this.setState({name: text})} />
        </Item>
				<Item>
	            <Input placeholder="Description"
							onChangeText={(text) => this.setState({desc: text})} />
	      </Item>
				</Form>

				<ListItem onPress={()=> this.setState({ unisex: !this.state.unisex })}>
					<CheckBox value={this.state.unisex}
					title="Unisex"
					checked={this.state.unisex}
					onPress={()=> this.setState({ unisex: !this.state.unisex })}/>
					<Body>
						<Text>Unisex</Text>
					</Body>
				</ListItem>

				<ListItem onPress={()=> this.setState({ baby: !this.state.baby })}>
					<CheckBox value={this.state.baby}
					title="Baby"
					checked={this.state.baby}
					onPress={()=> this.setState({ baby: !this.state.baby })}/>
					<Body>
						<Text>Baby</Text>
					</Body>
				</ListItem>

				<ListItem onPress={()=> this.setState({ disabled: !this.state.disabled })}>
					<CheckBox value={this.state.disabled}
					title="Disabled"
					checked={this.state.disabled}
					onPress={()=> this.setState({ disabled: !this.state.disabled })}/>
					<Body>
						<Text>Disabled</Text>
					</Body>
				</ListItem>

				<ListItem onPress={()=> this.setState({ payToUse: !this.state.payToUse })}>
					<CheckBox value={this.state.payToUse}
					title="Pay to Use"
					checked={this.state.payToUse}
					onPress={()=> this.setState({ payToUse: !this.state.payToUse })}/>
					<Body>
						<Text>Pay to Use</Text>
					</Body>
				</ListItem>
				<Button //get the user location on submit button press then send data to db
					block light
					style={{marginTop: 50}}
					onPress = {async () => {
						await this._getLocationAsync();
						addLocationToDynamo(this.state);
					}}
				>
				<Text>Submit</Text>
				</Button>
			</View>
			</Container>
		);
	}
}
