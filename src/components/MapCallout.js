import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { Icon } from 'native-base';

var AWS = require('aws-sdk')

// aws config using global obtained credentials
AWS.config.region = 'us-east-1';
AWS.config.credentials = global.creds;

//database connection
var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

export default class MapCallout extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			rating: false,
			baby: '',
			disabled: '',
			unisex: '',
			paytouse: ''
		}
	}

	componentDidMount() {

		// query parameters
		var ratingParams = {
			TableName: "toilets",
			ExpressionAttributeValues: {                  // set string for use in expressions
				":latLong": this.props.longLat,
				":spec": "rating"
			},
			KeyConditionExpression: "longLat = :latLong",  // partition key comparison
			FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
			ProjectionExpression: "upvote, downvote"
		};
		// query parameters
		var tagParams = {
			TableName: "toilets",
			ExpressionAttributeValues: {                  // set string for use in expressions
			  ":latLong": this.props.longLat,
			  ":spec": "tag"
			},
			KeyConditionExpression: "longLat = :latLong",  // partition key comparison
			FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
			ProjectionExpression: "baby, disabled, paytouse, unisex"
		};

			// query database
		ddb.query(ratingParams, (err, data) => {
			if (err) {
				console.log(err);   // return empty array if no data so nothing breaks...
			} else {				// return array of location items if query works
				if (data.Count == 0) {
					return;
				} else {
					this.setState({
						rating: (data.Items[0].upvote/(data.Items[0].upvote + data.Items[0].downvote))*100
					})
				}
			}
		});

		ddb.query(tagParams, (err, data) => {
			if (err) {
				console.log(err);   // return empty array if no data so nothing breaks...
			} else {
				// console.log('hi')
				// console.log(data);  // return array of location items if query works
				if (data.Count == 0) {
					return;
				} else {
					this.setState({baby: data.Items[0].baby})
					this.setState({disabled: data.Items[0].baby})
					this.setState({unisex: data.Items[0].baby})
					this.setState({paytouse: data.Items[0].baby})
				}
			}
		});

	}

	checkIcons(state) {
		if (state == false) {
			return <Icon type="Ionicons" name='close' style={{size: 10}}/>
		} else {
			return <Icon type="Ionicons" name='checkmark' style={{size: 10}}/>
		}
	}

	render() {
		return (
			<View>
			<Text>Baby: {this.checkIcons(this.state.baby)}</Text>
			<Text>Handicap Accessible: {this.checkIcons(this.state.disabled)}</Text>
			<Text>Pay to Use: {this.checkIcons(this.state.paytouse)}</Text>
			<Text>Unisex: {this.checkIcons(this.state.unisex)}</Text>
				<Text style={{textDecorationLine: 'underline', marginTop: 5}}>Press to see more info...</Text>
			</View>
		)
	}
}
