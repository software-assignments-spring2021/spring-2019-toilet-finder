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

//Justin's Tests
