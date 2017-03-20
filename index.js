var express = require('express');
var app = express();
var pg = require('pg');

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
		done();
		if (err){
			console.error(err);
			response.send("Error: " + err);
		}
		else{
			response.render('pages/db', {results: result.rows})
		}
	});
});