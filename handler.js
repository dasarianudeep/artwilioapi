'use strict';

const config = require('./config');
const client = require('twilio')(config.accountSid, config.authToken);

module.exports.send = (event, context, callback) => {
  const response = {
      statusCode: 200,
      headers: {
             'Access-Control-Allow-Origin': '*',
           },
      body: JSON.stringify({
        message: 'Successfully Sent'
      }),
  };

    const body = JSON.parse(event.body);

    client.messages
        .create({
            body: body.message,
            from: '+18126254025',
            to: '+1'+body.mobileno
        })
        .then(message => {
            console.log(message.sid);
            callback(null, response);
        })
};
