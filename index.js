var express = require('express');
var pg = require('pg');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request,response){
	response.render('Hello');
});

