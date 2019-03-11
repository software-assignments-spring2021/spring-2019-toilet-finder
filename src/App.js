import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Platform,
  TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { Constants, Location, Permissions } from 'expo';

export default class App extends React.Component {
  state = {
    location: null,
    errorMessage: null,
  };

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Error with Android Emulator, try on your device',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };

  render() {

    let text = "Loading";
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location);
    }
    console.log(text);
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
          onPress={() => {
            if (Location.hasServicesEnabledAsync())
              Alert.alert(text);
          }}
          style={styles.findButton}
          title="Find The Nearest Bathroom"
          color="red"
        />
      </View>
    );
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
