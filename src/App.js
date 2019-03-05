import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View } from 'react-native';

export default class App extends Component {
  //A function that simply pops up an alert upon clicking a button
  locationClick() {
    Alert.alert('You are currently at ...')
  }
  rankingClick() {
    Alert.alert("Rank toilets by distance")
  }

  render() {
    return (
      <View style={styles.container}>
        //Button that would show current location
        <View style={styles.buttonContainer}>
          <Button
            onPress={this.locationClick}
            title="Current location"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this.rankingClick}
            title="Toilets by distance"
          />
        </View>
      </View>
    );
  }
}


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

AppRegistry.registerComponent('AwesomeProject', () => App);
