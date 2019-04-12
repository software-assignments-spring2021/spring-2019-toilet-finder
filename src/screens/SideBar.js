import React from 'react';
import { View } from 'react-native';
import { Button, Text, Container, Content, ListItem, List, Body, Left, Right, Switch, Icon } from 'native-base';
import HomeScreen from './HomeScreen';
import AddLocationScreen from './AddLocationScreen';


export default class SideBar extends React.Component {
	render(){
		return(
			<Container>
				<Content style={{height: 70, paddingTop: 20, backgroundColor: 'white'}}>
					<List>
						<ListItem>
							<Left>
								<Icon name="add" style={{color:'black'}}/>
							</Left>
							<Body>
								<Text>Add Location</Text>
							</Body>
						</ListItem>
						<ListItem>
							<Left>
								<Icon name="map" style={{color:'black'}}/>
							</Left>
							<Body>
								<Text>Toilet Map</Text>
							</Body>
						</ListItem>
					</List>
				</Content>
			</Container>
		)
	}
}
