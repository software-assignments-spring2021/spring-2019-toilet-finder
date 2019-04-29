import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, AsyncStorage, Image } from 'react-native';
import {
	Container,
	Header,
	Content,
	Button,
	Text,
	List,
	ListItem
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
		this.state = {
			isLoading: true,
			baby: false,
			disabled: false,
			paytouse: false,
			unisex: false
		};
	}


	static navigationOptions = {
		title: 'Location Information',
		headerStyle: {
			backgroundColor: '#EFE1B0'
		}
	};

	componentDidMount() {
		console.log('mounted');
	  // query parameters
	  var param = {
	    TableName: "toilets",
	    ExpressionAttributeValues: {                  // set string for use in expressions
	      ":latLong": this.params.longLat,
	      ":spec": "tag"
	    },
	    KeyConditionExpression: "longLat = :latLong",  // partition key comparison
	    FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
	    ProjectionExpression: "baby, disabled, paytouse, unisex"
	  };

	  // query database
	  ddb.query(param, (err, data) => {
	    if (err) {
	      console.log(err);
	      return [];          // return empty array if no data so nothing breaks...
	    } else {
	      console.log(data);
				this.setState({
					isLoading: false,
					baby: data.Items[0].baby,
					disabled: data.Items[0].disabled,
					paytouse: data.Items[0].paytouse,
					unisex: data.Items[0].unisex
				});
	    }
	  });
	}

	render(){
		if (this.state.isLoading == false) {
			return(
				<Container style={{alignItems: 'center', backgroundColor: '#d6f3ff'}}>
				<Text style={{fontWeight: 'bold', fontSize: 30, paddingBottom: 15, paddingTop: 15}}>Bathroom: {this.params.name}</Text>
					<Content>
						<Text style={{fontSize: 20, marginLeft: 60}}>Rating %</Text>
						<View style={{flexDirection: "row"}}>
						<Button success style={{marginRight: 10}}><Text> Upvote </Text></Button>
						<Button danger><Text> Downvote </Text></Button>
						</View>
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
          </List>
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
