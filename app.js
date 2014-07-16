
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var cors = require('cors');
var request = require('request');

var app = express();

// all environments
app.set('port', 58826);
app.use(cors());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

function copySubset(o, properties) {
    var result = {};
    for (i = 0; i < properties.length; i++) {
        if (o[properties[i]] !== undefined) {
            result[properties[i]] = o[properties[i]];
        }
    }
    return result;
}

app.get('/', function(req, res, next) {
    var i;

    if (req.query.url === undefined) {
        res.send(400, "Missing query parameter 'url'");
        return;
    }

    var forwardedRequestHeaders = ["content-type", "user-agent", "accept"];
    
    var options = {
        url: req.query.url,
        headers: copySubset(req.headers, forwardedRequestHeaders)
    };

    request(options, function (error, response, body) {
        if (error) {
            res.send(400, error);
        } else {
            var forwardedResponseHeaders = ["content-type", "date"];
            for (i = 0; i < forwardedResponseHeaders.length; i++) {
                if (response.headers[forwardedResponseHeaders[i]] !== undefined) {
                    res.set(forwardedResponseHeaders[i], response.headers[forwardedResponseHeaders[i]]);
                }
            }

            res.send(response.statusCode, body);
        }
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
