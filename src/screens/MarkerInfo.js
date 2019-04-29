import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import {
	Container,
	Header,
	Content,
	Button,
	Text

} from 'native-base';

var AWS = require('aws-sdk')

// aws config using global obtained credentials
AWS.config.region = 'us-east-1';
AWS.config.credentials = global.creds;

//database connection
var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

export default class MarkerInfo extends React.Component {
	constructor(props) {
		super(props);
		this.params = this.props.navigation.state.params;
	}
	render(){
		return(
			<Container>
			<Text style={{fontWeight: 'bold', fontSize: 30, paddingBottom: 15}}>Bathroom: {this.params.name}</Text>
				<Content style={{alignItems: 'center'}}>
					<Text style={{fontSize: 20, marginLeft: 35}}>Rating %{this.params.rating}</Text>
					<View style={{flexDirection: "row"}}>
					<Button success style={{marginRight: 10}}><Text> Like </Text></Button>
					<Button danger><Text> Dislike </Text></Button>
					</View>
					<Text>tags: {this.params.tags}</Text>
					<Text>description: {this.params.description}</Text>
				</Content>


			</Container>


		)
	}
}
