
var httpProxy = require('http-proxy');
var querystring = require('querystring')
var url  = require('url');

var argv = process.argv;

var env = process.env;
if(env.HOST && env.API_KEY && env.PORT) {
  //running on heroku
  var host = env.HOST;
  var api_key = env.API_KEY;
  var port = env.PORT;
} else {
  // command line
  if(argv.length < 4) {
    console.log('usage: node app.js cartodb_host api_key');
    console.log('\nexample:');
    console.log('    node app.js examples.cartodb.com 1af665a5f5d5D');
    process.exit();
  }
  var host = argv[2];
  var api_key = argv[3];
  var port = 9090;
  if(argv.length > 4) {
    port = parseInt(argv[4], 10);
  }
}


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

function escapeSql(val) {
  val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
    switch (s) {
      case "\0":
        return "\\0";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\b":
        return "\\b";
      case "\t":
        return "\\t";
      case "\x1a":
        return "\\Z";
      default:
        return "\\" + s;
    }
  });

  return val;
}

function template(s, vars){
 for(var p in vars) {
   s = s.replace(new RegExp('{' + p + '}','g'), escapeSql(vars[p]));
 }
 return s;
}

var proxy = new httpProxy.HttpProxy({
  target: {
    host: host,
    port: 443,
    https: true 
  }
});

httpProxy.createServer(function (req, res) {
  var vars = url.parse(req.url, true).query
  // remove params
  req.url += req.url + (~req.url.indexOf('?') ? '&' : '?') + "api_key=" + api_key;
  var paramsTmpl = get_params_for_url(req.url);
  var params = {};
  for(var p in paramsTmpl) {
    params[p] = template(paramsTmpl[p], vars);
  }
  req.url += "&" + querystring.stringify(params);

  req.headers['Host'] = host;
  req.method = 'GET'
  req.headers['Content-Length'] = 0;
  console.log(req.url);

  proxy.proxyRequest(req, res)

}).listen(port);

console.log("listening on port " + port);

