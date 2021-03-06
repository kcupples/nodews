var express = require('express');
var app = express();
var pg = require('pg');
var soap = require('soap');
var url;

//get the WSDL to pass to the SOAP listener
var xml = require('fs').readFileSync('./wsdl/getQuoteWorking.wsdl', 'utf8');


//output the WSDL to console

console.log(xml);

//Set the services JSON object that is passed to the SOAP listener
var MyService = {
	getQuote: {
		getQuoteSOAP : {
			getQuoteOperation: function(args, callback) {
				console.log('In Web Service:');
				console.log(args);
				//console.log(args.Items)
				//console.log(args.Items.length);
				
				
				var length = args.Items.length;
				var SKUList='';
				var queryString ='';
				var resultString = '';
				var dbResults;
				var itemsObject =[];
				console.log('New WSDL');

				
				try {
				console.log('Length: ' + length);
				if (length===undefined){
					length=1;
				}

				
				//Build SQL Statement and the Results Object Arguments Passed
				for (var i=0; i<length; i++){
					
					if (length >1)
					{
						SKUList += "'" + args.Items[i].SKU +"'" + ',';
						console.log(i);
						console.log(SKUList);
						itemsObject.push(
						{
							Quantity: args.Items[i].Quantity,
							SKU: args.Items[i].SKU,
							TotalPrice: "55",
							UnitPrice: "0"
						});
					}
					else {
						console.log('Only One Item');
						console.log(SKUList);
						SKUList += "'" + args.Items.SKU +"'" + ',';
						itemsObject.push(
						{
							
							Quantity: args.Items.Quantity,
							SKU: args.Items.SKU,
							TotalPrice: "55",
							UnitPrice: "0"
						});

					}
				}
				SKUList = SKUList.substring(0, SKUList.length-1);
				
				console.log(SKUList);
				queryString = ('SELECT SKU, PRICE from CUST_PRICE_TABLE WHERE CUSTOMERNUMBER=' +"'" + args.CustomerNumber +"'" + ' AND SALESORG=' +"'" + args.SalesOrg +"'" + ' AND SKU IN (' +SKUList+')');
				console.log(queryString);

				//Query The Database
				pg.connect(process.env.DATABASE_URL, function(err, client, done){
						if (err){
							console.log('DB Connect Error: ' + err);
							callback('DB Error: ' +err);
						}
						else
						{


						console.log('Connected to DB');
						client.query(queryString, function(err, result){
							if (err){
								console.error('DB Query Error: ' + err);
								callback('DB Query Error: ' + err + ': ' + queryString);
							}
							else{
								dbResults = result.rows;
								resultString = JSON.stringify(result.rows);
								console.log('Returning: ' +resultString);
								for (var i=0; i<itemsObject.length; i++){
									for (var y=0; y<dbResults.length; y++){
										console.log('Item Increment: ' +i);
										console.log('DB Increment: ' +y);
										console.log('Item SKU: ' + itemsObject[i].SKU);
										console.log('Db SKU: '+ dbResults[y].sku);
										
										if (itemsObject[i].SKU == dbResults[y].sku){
											console.log('Match');
											itemsObject[i].TotalPrice = (itemsObject[i].Quantity * dbResults[y].price).toString();
											itemsObject[i].UnitPrice = dbResults[y].price.toString();
										}


									}
								
								}
								console.log('Calculated Price: ' +JSON.stringify(itemsObject));
								//Send the response with the callback function
								callback({ 
									Items: itemsObject
								});
							}
						});
					}

					});
			}
			catch (err){
				console.log('Generic Error: ' + err);
				callback('Generic Error: ' + err);
			}
				 

			}
		}
	}
};

//Configure the SOAP Listener 
server = app.listen((process.env.PORT || 5000), function () {
	//var soapServer = soap.listen(app, '/SayHello', service, wsdl);
    var soapServer = soap.listen(app, '/getQuoteOperation', MyService, xml);
    url = 'http://' + server.address().address + ':' + server.address().port;
    if (server.address().address === '0.0.0.0' || server.address().address === '::') {
    	url = 'http://127.0.0.1:' + server.address().port;
    }
});
  

//Set the Home Page
app.get('/', function (request, response) {
   response.send('<h1>SOAP Quote Generator </h1><p>Postgres database contains customer specific pricing</p><p><a href="/db">Click here</a> for a list of records in the database</p><p><a href="https://sleepy-castle-97478.herokuapp.com/getQuoteOperation?wsdl">Click here</a> for the WSDL</p>');
});

//Send the WSDL when requested
app.get('/wsdl', function (request, response) {
   response.send(xml);
});

//Just a test 
app.get('/db', function(request, response){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query('SELECT * from cust_price_table', function(err, result)
		{
			//done();
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
