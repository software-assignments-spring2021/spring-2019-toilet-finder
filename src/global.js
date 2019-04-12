// initializing global variables to be used in the screens

var AWS = require('aws-sdk')

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
var creds = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:e7994f82-231f-43db-9a9b-e1868280592f',
});

// store the obtained credentials in the global variable
global.creds = creds;