import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';

class AddLocationScreen extends Component {
	render() {
		return (
			<View style={styles.container}>
				<Text>AddLocationScreen</Text>
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