var express = require('express');
var app = express();
var pg = require('pg');
var soap = require('soap');
var url;


//get the WSDL to pass to the SOAP listener
var xml = require('fs').readFileSync('./wsdl/getQuoteWorking.wsdl', 'utf8');

var wsdl = '<definitions name="HelloService" targetNamespace="http://www.examples.com/wsdl/HelloService.wsdl" xmlns="http://schemas.xmlsoap.org/wsdl/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:tns="http://www.examples.com/wsdl/HelloService.wsdl" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><message name="SayHelloRequest"><part name="firstName" type="xsd:string"/></message><message name="SayHelloResponse"><part name="greeting" type="xsd:string"/></message><portType name="Hello_PortType"><operation name="sayHello"><input message="tns:SayHelloRequest"/><output message="tns:SayHelloResponse"/></operation></portType><binding name="Hello_Binding" type="tns:Hello_PortType"><soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/><operation name="sayHello"><soap:operation soapAction="sayHello"/><input><soap:body encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" namespace="urn:examples:helloservice" use="encoded"/></input><output><soap:body encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" namespace="urn:examples:helloservice" use="encoded"/></output></operation></binding><service name="Hello_Service"><documentation>WSDL File for HelloService</documentation><port binding="tns:Hello_Binding" name="Hello_Port"><soap:address location="http://localhost:51515/SayHello/" /></port></service></definitions>';

//output the WSDL to console
console.log(xml);

//Set the services JSON object that is passed to the SOAP listener
var MyService = {
	getQuote: {
		getQuoteSOAP : {
			getQuoteOperation: function(args) {
				console.log('GotIt');
				return {
				Items: {Item: [{SKU:55555,Quantity:5,Price: 524}, {SKU:66666,Quantity:6,Price: 624}]}
					
				};
			}
		}
	}
};

 var service = {
      Hello_Service: {
        Hello_Port: {
          sayHello: function (args) {
          	console.log("test");
            return {
              greeting: args.firstName
            };
          }
        }
      }
    };

  server = app.listen((process.env.PORT || 5000), function () {
      //var soapServer = soap.listen(app, '/SayHello', service, wsdl);
      var soapServer = soap.listen(app, '/getQuoteOperation', MyService, xml);
      url = 'http://' + server.address().address + ':' + server.address().port;
      if (server.address().address === '0.0.0.0' || server.address().address === '::') {
        url = 'http://127.0.0.1:' + server.address().port;
      }
    });
  
 /*Call the SOAP listener using express
  server = app.listen(8001, function(){
      //Note: /wsdl route will be handled by soap module
      //and all other routes & middleware will continue to work
      var soapServer = soap.listen(app, '/getPrice', service, xml);
      url = 'http://' +server.address().address + ':' + server.address().port;
      console.log(url);
      if (server.address().address === '::'){
      	url = 'http://127.0.0.1:' + server.address().port;
      	console.log(url);
      }
  });
*/


/*app.set('port', (process.env.PORT || 5000));
//app.use(express.static('public'));

//app.get('/', function (request, response) {
   //response.send("Hi There");
//});

//app.listen(app.get('port'), function() {
//  console.log('Node app is running on port', app.get('port'));
//});

//app.get('/db', function(request, response){
	//pg.connect(process.env.DATABASE_URL, function(err, client, done){
		//client.query('SELECT * from test_table', function(err, result)
		//{
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

//app.use('/soap', require('./lib/soaplistener.js')());*/