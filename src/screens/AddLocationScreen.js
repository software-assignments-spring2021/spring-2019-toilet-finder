import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Button
} from 'react-native';
import { Constants, MapView, Location, Permissions} from 'expo';

var AWS = require('aws-sdk')

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
var creds = new AWS.CognitoIdentityCredentials({
	IdentityPoolId: 'us-east-1:e7994f82-231f-43db-9a9b-e1868280592f',
});

AWS.config.credentials = creds;

// database connection
var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});


// Adds a location to dynamodb using given data passed in 
function addLocationToDynamo(state) {

	/* 
		parameters to be entered into the database

		TableName = the name of the dynamodb database (do not change this)
		Item = the attributes (columns) and their data
			long_lat (required) = the partition key to uniquely identify the location 
			spec_type (required) = the sort key to group data entries by location, tags, or reviews
				these are hard-coded into the object being passed in already
			name, longitude and latitude all come from the user
	*/
	var params = {
		TableName: "toilets",
		Item: {
			"long_lat": longLatToString(state.location['coords']['longitude'], state.location['coords']['latitude']),
			"spec_type": state.loc,
			"name": state.name,
			"longitude": state.location['coords']['longitude'],
			"latitude": state.location['coords']['latitude']
		}
	}

	// sending data to the database
	ddb.put(params, function(err, data) {
	  if (err) {
	    console.log("Error", err.code, err.message);
	  } else {
	    console.log("Data has been entered into ", data.TableNames);
	  }
	});
}

function longLatToString(long, lat) {
	var longString = long.toString();
	var latString = lat.toString();

	return str = longString + "+" + latString;
}

class AddLocationScreen extends Component {

	 
	// user data to be sent to the database
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			long_lat: '',
			location: null,
			errorMessage: null,
			loc: "loc",
			tag: "tag",
			review: "review",
		};
	}

	// function to get the user's location data
	_getLocationAsync = async () => {

		// making sure to get user permission first
		let { status } = await Permissions.askAsync(Permissions.LOCATION);
		if (status !== 'granted') {
			this.setState({
				errorMessage: 'Permission to access location was denied',
			});
		}
		let location = await Location.getCurrentPositionAsync({});
		this.setState({ location });
	};

	// rendering of the app screen
	render() {
		return (
			<View style={{paddingTop: 20}}>

				<TextInput		// text input box for the user to enter the location name
					style={{height: 30}}
					placeholder="Enter a Location Name Here"
					onChangeText={(text) => this.setState({name: text})}
				/>
				
				<Button			// get the user location on submit button press then send data to db

					// ***need to add alert for when submission is successful and when it isn't
					onPress = {async () => {
						await this._getLocationAsync();
						addLocationToDynamo(this.state);
					}}
					title = "Submit Location"
				/>
			</View>
		  );
		}
}

export default AddLocationScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
});

// module.exports = longLatToString;
// testing travis ci

exports.longLatToString = longLatToString;
