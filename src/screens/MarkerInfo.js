import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import {
	Container,
	Header,
	Content,
	Button,
	Text

} from 'native-base';

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
					<Text style={{fontSize: 20, marginLeft: 35}}>Rating %</Text>
					<View style={{flexDirection: "row"}}>
					<Button success style={{marginRight: 10}}><Text> Like </Text></Button>
					<Button danger><Text> Dislike </Text></Button>
					</View>
					<Text>Disabled: {this.params.disabled}</Text>
				</Content>


			</Container>


		)
	}
}
