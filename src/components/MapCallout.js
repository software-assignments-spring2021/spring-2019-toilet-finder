import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions } from 'react-native';

export default class MapCallout extends React.Component {
	render() {
		return (
			<View>
				<Text>Bathroom Name: {this.props.name }</Text>
				<Text>Location: {this.props.location }</Text>
				<Text>Description: {this.props.description }</Text>
			</View>
		)
	}
}
