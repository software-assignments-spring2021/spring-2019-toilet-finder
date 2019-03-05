import React from 'react';

test('testing Current Location button click event', () => {
  window.alert = jest.fn();
  // const output = shallow(
  //   <Link title="Current location" />
  // );
  // output.simulate('click');
  expect(window.alert).toHaveBeenCalledWith('clicked');
});