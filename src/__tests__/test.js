import React from 'react';
import App from '../App.js';
import HomeScreen from '../screens/HomeScreen.js';
import AddLocationScreen from '../screens/AddLocationScreen.js';
import renderer from 'react-test-renderer';

//Yuankai's Tests
// const longLatToString = require("../screens/AddLocationScreen.js");
// var AddLocationScreen = require("../screens/AddLocationScreen.js");

test('converts 1.1 and 2.2 to strings and combines them to make 1.1+2.2', () => {
	//Mock object to be made
	let str = "1.1+2.2-";
	let compare = AddLocationScreen.longLatToString(1.1, 2.2);
	let i = compare.length;
	str = str.concat(compare[i-1]);
	expect(compare).toBe(str);
})

test('False if 1.1 and 2.2 comes out without -int at the end', () => {
	//Mock object to be made
	let str = "1.1+2.2";
	let compare = AddLocationScreen.longLatToString(1.1, 2.2);
	expect(compare).not.toBe(str);
})

test('Check if the dash primary key got created properly with a dash', () => {
	let dash = RegExp('-');
	let answer = AddLocationScreen.longLatToString(1.1, 2.2);
	expect(dash.test(answer)).toBe(true);
})

//Demo function for sorting by distance later
//   function sort(array){
//     if (array.length === 0){
//       return "There are no bathrooms near you";
//     }
//     array.sort(function(a, b){return a - b});
//     return array;
//   }

//Yuankai's Tests
//Demo function for sorting by distance later

//Esther's Tests


//Nicholas's Tests
// Screen rendering test
// it('HomeScreen renders correctly', () => {
// 	const tree = renderer.create(<View />).toJSON();
// 	expect(tree).toMatchSnapshot();
// });

// it('AddLocationScreen renders correctly', () => {
// 	const tree = renderer.create(<View />).toJSON();
// 	expect(tree).toMatchSnapshot();
// });

// it('check if component mounts properly to mobile OS', () => {
// 	let App = renderer.create(<App />).getInstance();
// 	expect(App.componentWillMount().toEqual(null));

// });

// it('check that _locationClick function produces an alert', () => {
// 	let HomeScreen = renderer.create(<HomeScree />.getInstance());
// 	let HomeScreen = renderer.create(<HomeScreen />.getInstance());
// 	expect(App._locationClick().toEqual(Alert.alert("You are currently at ...")));
// });

//Justin's Tests
// test('Sort distance from closest to farthest', () => {
//   expect(sort([5,4,3,2,1])).toEqual([1,2,3,4,5]);
// });
// test('Sort distance from closest to farthest', () => {
//   expect(sort([1,2,3])).toEqual([1,2,3]);
// });
// test('If there are no nearby bathrooms, state that there are none nearby', () => {
//   expect(sort([])).toEqual("There are no bathrooms near you");
// });
