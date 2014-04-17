pcf_module_gmaps = {
  draw: function(vars){
    var mapZoom = 10;
    if(typeof(vars.map_zoom) != 'undefined'){
      mapZoom = vars.map_zoom;
    }
    var mapOptions = {
          zoom: mapZoom,
          center: new google.maps.LatLng(vars.center_lat, vars.center_lng),
          disableDefaultUI: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      if(typeof(vars.map_id) == 'undefined'){
        console.log('A map id must be specified');
        return false;
      }
      else{
        if(typeof(vars.map_id) == 'string'){
          vars.map_id = this.gid(vars.map_id);
        }
      }
      var map = new google.maps.Map(vars.map_id, mapOptions);
      if(typeof(vars.markers) != 'undefined'){
        for (var i in vars.markers) {
            var marker = vars.markers[i];
            var myLatLng = new google.maps.LatLng(marker.lat, marker.lng);
            var defaults = {
              position: myLatLng,
              map: map,
            };
            var ignore = ['lat', 'lng', 'clickthru'];
            for(var m in marker){
              if(ignore.indexOf(marker[m]) == -1){
                defaults[m] = marker[m];
              }
            }
            var newMarker = new google.maps.Marker(defaults);
            if(typeof(marker.clickthru) != 'undefined'){
              newMarker.clickthru = marker.clickthru;
              google.maps.event.addListener(newMarker, 'click', function() {
                  var url = 'http://maps.google.com/?saddr='+vars.user_lat+','+vars.user_lng+'&daddr='+this.position.k+','+this.position.A;
                  if(typeof(this.clickthru.url) != 'undefined'){
                    url = this.clickthru.url;
                  }
                  if(typeof(this.clickthru.callback) == 'function'){
                    this.clickthru.callback();
                  }
                  if(pcf.isPhad){
                    if(pcf.phadConsoleLog){
                      ph.u.log(this.clickthru.name);
                    }
                    ph.u.clickthru(url, this.clickthru.name, pcf.sessionID);
                  }
                  else{
                    console.log(this.clickthru.name);
                    window.open(url, '_blank');
                  }
              });
            }
        }
      }
  },
  geo: function(vars){
    console.log(vars);
    var locType = 'address';
    if(typeof(vars.loc_type) != 'undefined'){
      locType = vars.loc_type;
    }
    if(this.geocoder == null){
      this.geocoder = new google.maps.Geocoder();
    }
    var self = this;
    if(locType == 'geo' || 'latLng'){
      console.log(vars.address);
      if(this.valid_geo(vars.address)){
        var geo = vars.address.split(',');
        var latLng = new google.maps.LatLng(geo[0], geo[1]);
        this.geocoder.geocode( { 'latLng' : latLng}, function(results, status) {
          self.gmaps_return(results, status, vars);
          });
      }
      else{
        console.log('Must be a valid lat/lng set for reverse geocoding');
        return false;
      }

    }		else{
      console.log(vars.address);
      this.geocoder.geocode( { 'address' : encodeURIComponent(vars.address)}, function(results, status) {
        console.log(results);
        console.log(status);
        self.gmaps_return(results, status, vars);
        });
    }
  },
  return: function(results, status, vars){
    if(status == google.maps.GeocoderStatus.OK) {
      vars.callback(results);
         }
         else{
           if(typeof(vars.failover) == 'boolean'){
             if(vars.failover){
               var geoVars = {};
               geoVars.callback = vars.callback;
               if(typeof(vars.failover_callback) != 'undefined'){
                 geoVars.callback = vars.failover_callback;
               }
               if(this.valid_zip(address)){
            geoVars.data.type =  'postal_code';
          }
          if(this.valid_geo(address)){
            geoVars.data.type =  'city_postal_by_geo';
          }
          if(typeof(geoVars.data.type) != 'undefined'){
            geoVars.data.value = vars.address;
          }
               this.geolocation(geoVars);
             }
           }
           else{
             vars.callback(false);
           }
         }
  },
}
