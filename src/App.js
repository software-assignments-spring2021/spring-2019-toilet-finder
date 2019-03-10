import React from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import MapView from 'react-native-maps';

export default class App extends React.Component {
  render() {
    return (
      <View style={{flex:1}}>
        <MapView
          style={styles.map}
          provider="google"

          initialRegion={{
            latitude: 40.76727216,
            longitude: -73.99392888,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
        ></MapView>
        <Button
          onPress={this.handlePress}
          style={styles.findButton}
          title="Find The Nearest Bathroom"
          color="red"
        />
      </View>
    );
  }

  handlePress = () => {
    // Process current location and search for bathrooms
  }

  
}

const styles = StyleSheet.create({
  findButton: {
    // Add styles to the search button
  },
  map: {
    zIndex: -1,
    flex: 1
  },
});
