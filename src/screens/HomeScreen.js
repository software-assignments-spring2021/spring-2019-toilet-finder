import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	Button,
	Alert
} from 'react-native';

class HomeScreen extends Component {
	//A function that simply pops up an alert upon clicking a button
  _locationClick() {
    Alert.alert('You are currently at ...')
  }
  _rankingClick() {
    Alert.alert('Rank toilets by distance')
  }

  render() {
    return (
      <View style={styles.container}>
      	<View style={styles.buttonContainer}>
          <Button
            onPress={this._locationClick}
            title="Current location"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this._rankingClick}
            title="Toilets by distance"
          />
        </View>
      </View>
    );
  }
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    margin: 20
  },
});