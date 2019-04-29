// initializing global variables to be used in the screens

var AWS = require('aws-sdk')

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
var creds = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:e7994f82-231f-43db-9a9b-e1868280592f',
});

// store the obtained credentials in the global variable
global.creds = creds;
global.googleMapsAPIKEY = 'AIzaSyBXXzi2CvuVF1-ooO1-HZ-2TamYAYW-xSc';


// set credentials for the connection
AWS.config.credentials = global.creds;

// database connection
var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});


// For all of the following get functions, pass in the longLat string  

function getLocationData(latLong) {

  // query parameters
  var params = {
    TableName: "toilets",     
    ExpressionAttributeNames: {
      "#name": "name"
    },
    ExpressionAttributeValues: {                  // set string for use in expressions
      ":latLong": latLong,
      ":spec": "loc"
    },
    KeyConditionExpression: "longLat = :latLong",  // partition key comparison
    FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
    ProjectionExpression: "#name, longitude, latitude"
  };

  // query database 
  ddb.query(params, (err, data) => {
    if (err) {
      console.log(err);
      return [];          // return empty array if no data so nothing breaks...
    } else {  
      console.log(data)
      return data.Items;  // return array of location items if query works
    }
  });
}

function getTagData(latLong) {

  // query parameters
  var params = {
    TableName: "toilets",     
    ExpressionAttributeValues: {                  // set string for use in expressions
      ":latLong": latLong,
      ":spec": "tag"
    },
    KeyConditionExpression: "longLat = :latLong",  // partition key comparison
    FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
    ProjectionExpression: "baby, disabled, paytouse, unisex"
  };

  // query database 
  ddb.query(params, (err, data) => {
    if (err) {
      console.log(err);
      return [];          // return empty array if no data so nothing breaks...
    } else {  
      console.log(data)
      return data.Items;  // return array of location items if query works
    }
  });
}

function getRatingData(latLong) {

  // query parameters
  var params = {
    TableName: "toilets",     
    ExpressionAttributeValues: {                  // set string for use in expressions
      ":latLong": latLong,
      ":spec": "rating"
    },
    KeyConditionExpression: "longLat = :latLong",  // partition key comparison
    FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
    ProjectionExpression: "upvote, downvote"
  };

  // query database 
  ddb.query(params, (err, data) => {
    if (err) {
      console.log(err);
      return [];          // return empty array if no data so nothing breaks...
    } else {  
      console.log(data)
      return data.Items;  // return array of location items if query works
    }
  });
}

function getDescription(latLong) {

  // query parameters
  var params = {
    TableName: "toilets",   
    ExpressionAttributeNames: {
      "#desc": "desc"
    },  
    ExpressionAttributeValues: {                  // set string for use in expressions
      ":latLong": latLong,
      ":spec": "desc"
    },
    KeyConditionExpression: "longLat = :latLong",  // partition key comparison
    FilterExpression: "spec_type = :spec",          // filter my loc to get all locations
    ProjectionExpression: "#desc"
  };

  // query database 
  ddb.query(params, (err, data) => {
    if (err) {
      console.log(err);
      return [];          // return empty array if no data so nothing breaks...
    } else {  
      console.log(data)
      return data.Items;  // return array of location items if query works
    }
  });
}

export { 
  getLocationData, 
  getTagData,
  getRatingData,
  getDescription
}




