
var httpProxy = require('http-proxy');
var querystring = require('querystring')

var argv = process.argv;

if(argv.length != 4) {
  console.log('usage: node app.js cartodb_host api_key');
  console.log('\nexample:');
  console.log('    node app.js examples.cartodb.com 1af665a5f5d5D');
  process.exit();
}

var host = argv[2];
var api_key = argv[3];

var config = {}
try {
  config = require('./config')
} catch(e) { }

function get_params_for_url(url) {
  for(var table in config) {
    if( url.indexOf('/' + table + '/') !== -1) {
      return config[table]
    }
  }
  return [];
}


httpProxy.createServer(function (req, res, proxy) {
  req.url += (~req.url.indexOf('?') ? '&' : '?') + "api_key=" + api_key;
  var params = get_params_for_url(req.url);
  req.url += "&" + querystring.stringify(params);
  //req.url = encodeURIComponent(req.url);
  req.headers['Host'] = host;
  req.method = 'GET'
  req.headers['Content-Length'] = 0;
  console.log(req.url);
  proxy.proxyRequest(req, res, {
    host: host,
    port: 80 
  });
}).listen(9090);

