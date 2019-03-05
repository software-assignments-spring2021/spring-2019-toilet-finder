import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Button
} from 'react-native';

class HomeScreen extends Component {
	render() {
		return (
			<View style={styles.container}>
				<Text>LoginScreen</Text>
			</View>
		);
	}
}

export default HomeScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
});