import React from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, AsyncStorage, Image } from 'react-native';
import {
	Container,
	Header,
	Content,
	Button,
	Text,
	List,
	Input,
	ListItem,
	Item,
	Icon
} from 'native-base';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default class SearchBathrooms extends React.Component {
	constructor(props) {
		super(props);
	}

	static navigationOptions = {
		title: 'Search Locations',
		headerStyle: {
			backgroundColor: '#EFE1B0'
		}
	};

	render(){
		return (
			<GooglePlacesAutocomplete
				placeholder='Search a location...'
				minLength={2} // minimum length of text to search
				autoFocus={false}
				returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
				keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
				listViewDisplayed='auto'    // true/false/undefined
				fetchDetails={true}
				renderDescription={row => row.description} // custom description render
				onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
					this.props.navigation.navigate('Home', {
						searchLong: details.geometry.location.lng, searchLat: details.geometry.location.lat
					});
				}}

				getDefaultValue={() => ''}

				query={{
					// available options: https://developers.google.com/places/web-service/autocomplete
					key: 'AIzaSyDukdG_-84j_R68HjX5wJA_Q6G4IOX0v04',
					language: 'en', // language of the results
					types: 'establishment' // default: 'geocode', 'address', '(regions)'
				}}

				styles={{
					textInputContainer: {
						width: '100%'
					},
					description: {
						fontWeight: 'bold'
					},
					predefinedPlacesDescription: {
						color: '#1faadb'
					}
				}}

				GoogleReverseGeocodingQuery={{
					// available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
				}}
				GooglePlacesSearchQuery={{
					// available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
					rankby: 'distance',
					type: 'cafe'
				}}

				GooglePlacesDetailsQuery={{
					// available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
					fields: 'formatted_address',
				}}

				filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

				debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.

			/>
		)
	}
}
