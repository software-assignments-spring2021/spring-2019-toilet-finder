import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Button
} from 'react-native';

var AWS = require('aws-sdk')

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
var creds = new AWS.CognitoIdentityCredentials({
	IdentityPoolId: 'us-east-1:e7994f82-231f-43db-9a9b-e1868280592f',
});

AWS.config.credentials = creds;

var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

function addToDynamo(state) {
	var params = {
		TableName: "toilets",
		Item: {
			"long_lat": state.long_lat,
			"spec_type": state.text
		}
	}
	
	ddb.put(params, function(err, data) {
	  if (err) {
	    console.log("Error", err.code, err.message);
	  } else {
	    console.log("Table names are ", data.TableNames);
	  }
	});
}

function longLatToString(long, lat) {
	var longString = long.toString();
	var latString = lat.toString();

	return str = longString + "+" + latString;
}

class AddLocationScreen extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			text: '',
			long_lat: ''
		};
	}

	render() {
		return (
			<View style={{paddingTop: 20}}>
				<TextInput
				style={{height: 30}}
				placeholder="Enter a Location Name Here"
				onChangeText={(text) => this.setState({text: text})}
				/>
				<Button
					onPress = {() => {
						this.setState({long_lat: "please"})
						addToDynamo(this.state)
						console.log(this.state.text)
						console.log(this.state.long_lat)
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

exports.longLatToString = longLatToString;
