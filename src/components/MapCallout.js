import React from 'react';

export default class MapCallout extends React.Component {
	render() {
		return (
			<View>
				<Text>Bathroom Name: {this.props.name }</Text>
				<Text>Rating: {this.props.rating }</Text>
				<Text>Description: {this.props.description }</Text>
				<Text>Tags: {this.props.tags}</Text>
			</View>
		)
	}
}
