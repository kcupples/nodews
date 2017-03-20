var express = require('express');
var pg = require('pg');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request,response){
	response.render('pages/index.html');
});


app.get('/db', function(request, response)
{
	pg.connect(process.env.DATABASE_URL, function(err, client,done){
		client.query('SELECT * FROM test_table', function(err,result){
			done();
			if (err){
					console.error(err);
					response.send("Error: " + err);
			}
			else{
				response.render('pages/db', {results: result.rows});
			}

		});
	});
});
