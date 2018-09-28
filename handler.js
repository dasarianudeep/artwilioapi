'use strict';

const config = require('./config');
const client = require('twilio')(config.accountSid, config.authToken);
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId
});

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

module.exports.postarmodel = (event, context, callback) => {
    const body = JSON.parse(event.body);

    const objectParams = {
        Bucket: 'arexpo',
        Key: String(body.productid),
        Body: JSON.stringify({armodelurl: body.armodelurl})
    };

    s3.putObject(objectParams, (err, data) => {
        if (err) {
            return callback('[InternalServerError] Failed to update object in S3 object'+err.toString());
        }
        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data)
        });
    });
};

module.exports.postarmodelinfo = (event, context, callback) => {
    const body = JSON.parse(event.body);

    s3.getObject({ Bucket: 'arexpo', Key: String(body.productid)}, (err, data) => {
        if (err) {
            return callback('[InternalServerError] Failed to get object info from S3'+err.toString());
        }

        const objectData = {
            title: body.title,
            imageurl: body.imageurl,
            videourl: body.videourl,
            armodelurl: JSON.parse(data.Body.toString()).armodelurl
        };

        s3.putObject({ Bucket: 'arexpo', Key: String(body.productid), Body: JSON.stringify(objectData)}, (err, data) => {
           if (err) {
               return callback('[InternalServerError] Failed to put object info to S3'+err.toString());
           }

           callback(null, {
               statusCode: 200,
               headers: {
                   'Access-Control-Allow-Origin': '*',
               },
               body: JSON.stringify(data)
           });
        });
    })
};

module.exports.getarmodelinfo = (event, context, callback) => {

    s3.getObject({ Bucket: 'arexpo', Key: String(event.pathParameters.productid)}, (err, data) => {
        if (err) {
            return callback('[InternalServerError] Failed to get object info from S3'+err.toString());
        }
        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: data.Body.toString()
        });
    });
};
