var express = require('express');
var app = express();
var pg = require('pg');
var soap = require('soap');

var myService = {
	MyService: {
			MyPort: {
				MyFunction: function(args){
					return {
						name: args.name
					};
				},
				 // This is how to define an asynchronous function. 
              MyAsyncFunction: function(args, callback) {
                  // do some work 
                  callback({
                      name: args.name
                  });
              },
 
              // This is how to receive incoming headers 
              HeadersAwareFunction: function(args, cb, headers) {
                  return {
                      name: headers.Token
                  };
              },
 
              // You can also inspect the original `req` 
              reallyDetailedFunction: function(args, cb, headers, req) {
                  console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                  return {
                      name: headers.Token
                  };
              }
          }
      }
  };

app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));

app.get('/', function (request, response) {
   response.send("Hi There");
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/db', function(request, response){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query('SELECT * from test_table', function(err, result)
		{
			done();
			if (err){
				console.error(err);
				response.send("Error: " + err);
			}
			else {
				response.send(result.rows);
			}
		});
	});
});