import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';

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
			tags: false
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
					this.setState({rating: data.Items[0].upvote})
				}
			}
		});

		ddb.query(tagParams, (err, data) => {
			if (err) {
				console.log(err);   // return empty array if no data so nothing breaks...
			} else {
				console.log('hi')
				// console.log(data);  // return array of location items if query works
				if (data.Count == 0) {
					return;
				} else {
					this.setState({tags: data.Items[0].baby})
					console.log(this.state)
				}
			}
		});

	}

	render() {
		return (
			<View>
				<Text>Bathroom Name: {this.props.name}</Text>
				<Text>Rating: {this.state.rating.toString()}</Text>
				<Text>Tags: {this.state.tags.toString()}</Text>
			</View>
		)
	}
}
