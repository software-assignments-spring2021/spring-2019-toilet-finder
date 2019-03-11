import React from 'react';
import App from '../App.js';
import HomeScreen from '../HomeScreen.js';
import AddLocationScreen from '../AddLocationScreen.js';
import renderer from 'react-test-renderer';
//Yuankai's Tests


//Esther's Tests


//Nicholas's Tests
// Screen rendering test
it('HomeScreen renders correctly', () => {
	const tree = renderer.create(<View />).toJSON();
	expect(tree).toMatchSnapshot();
});

it('AddLocationScreen renders correctly', () => {
	const tree = renderer.create(<View />).toJSON();
	expect(tree).toMatchSnapshot();
});

it('check if component mounts properly to mobile OS', () => {
	let App = renderer.create(<App />).getInstance();
	expect(App.componentWillMount().toEqual(null));

});

it('check that _locationClick function produces an alert', () => {
	let HomeScreen = renderer.create(<HomeScree />.getInstance());
	expect(App._locationClick().toEqual(Alert.alert("You are currently at ...")));
});

//Justin's Tests
