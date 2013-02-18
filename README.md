  

# CartoDB tiler proxy

this script allows you to serve tiles from you private tables without need to expose them to public


## usage

  Lets create a proxy for a private table with some custom sql and cartoCSS.


  1) clone the repository in your server

    git clone git://github.com/javisantana/cartodb-tiles-proxy.git

  2) Enter in the folter and install the modules:

    cd cartodb-tiles-proxy && npm install

   
   this installs all the required dependencies

  3) get your api_key from your account dashboard and launch the app (forget the config.json for now)

    node app.js creemaps.cartodb.com API_KEY 9090

    
  this runs the proxy, it listens on port 9090 so if you point to your browser to the server you should see a tile:

  http://server_running_app:9090/TABLE/0/0/0.png


  4) create a config.json file like this in the same folder app.js is placed (you could add more tables):

  ```
    {
        "TABLE_NAME": {
            "sql": "select * from TABLE_NAME limit where column > 20",
            "tile_style": '#TABLE_NAME { #polygon-fill: red }'
        }
    }
  ```

  restart the server, access again to the tile, you will see the query is applied.  
  
  http://server_running_app:9090/TABLE/0/0/0.png


  5) now, to load it in a map you could use cartodb.js to load a map with this code:

  ```javascript
   function main() {

      var map = L.map('map', { 
        zoomControl: false,
        center: [43, 0],
        zoom: 3
      })

      // add a nice baselayer from mapbox
      L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
        attribution: 'Stamen'
      }).addTo(map);

      cartodb.createLayer(map, {
        type: 'cartodb',
        options: {
          table_name: 'TABLE_NAME',
          interactivity: 'color_count',
          user_name: '',
          tiler_domain: 'localhost',
          tiler_port: '9090',
          no_cdn: true
        }
      })

      .on('done', function(layer) {
        map.addLayer(layer);

        layer.on('featureClick', function(e, pos, latlng, data) {
          alert("indowindow: " + data.color_count)
          cartodb.log.log(e, pos, latlng, data);
        });

      })

    }

    window.onload = main;
  ```

    
  default infowindow does not work, you need to manage your own infowindows








