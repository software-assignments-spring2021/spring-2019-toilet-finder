import React from 'react';
import App from '../App.js';
import HomeScreen from '../screens/HomeScreen.js';
import AddLocationScreen from '../screens/AddLocationScreen.js';
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
	let HomeScreen = renderer.create(<HomeScreen />.getInstance());
	expect(App._locationClick().toEqual(Alert.alert("You are currently at ...")));
});

//Justin's Tests
test('Sort distance from closest to farthest', () => {
  expect(sort([5,4,3,2,1])).toEqual([1,2,3,4,5]);
});
test('Sort distance from closest to farthest', () => {
  expect(sort([1,2,3])).toEqual([1,2,3]);
});
test('If there are no nearby bathrooms, state that there are none nearby', () => {
  expect(sort([])).toEqual("There are no bathrooms near you");
});
