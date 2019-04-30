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

export default class SearchBathrooms extends React.Component {
	constructor(props) {
		super(props);
		this.params = this.props.navigation.state.params;
	}

	static navigationOptions = {
		title: 'Search Bathrooms',
		headerStyle: {
			backgroundColor: '#EFE1B0'
		}
	};

	render(){
		return (
			<Container>
        <Header searchBar rounded style={{backgroundColor: '#EFE1B0'}}>
          <Item>
            <Icon name="ios-search" />
            <Input placeholder="Search" />
          </Item>
          <Button transparent>
            <Text>Search</Text>
          </Button>
        </Header>
      </Container>
		)
	}
}
