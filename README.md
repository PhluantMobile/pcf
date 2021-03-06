# Phluant Client Framework Library

The Phluant Client Framework (PCF) Library is a framework for use by Phluant Mobile's clients in developing their rich media campaign assets.  The concept of the framework is to provide our clients with a code base that works both inside and outside of our legacy ad serving network, which will substantially reduce the amount of time needed to launch a rich media campaign.  It also provides a number of core features that are very common in the rich media campaigns we run.  It is written in pure JavaScript, so all core features will work independently of jQuery or any other JavaScript framework library.  Some features may require supporting libraries (i.e. Google Maps) and will be indicated as such in the documentation.  The feature list is below.  

* [Element ID referencing](#element-id-referencing)
* [Initialization](#initialization)
* [Automatic MRAID detection and handling](#initialization)
* [Expands](#expands)
* [Contracts](#contracts)
* [Clickthroughs](#clickthroughs)
* [Custom trackers](#custom-trackers)
* [HTML5 video](#html5-video)
* [All geolocation and weather API calls to Phluant's resources](#geolocationweather-api-calls)
	* [Geolocation](#geolocation)
	* [Weather](#weather)
* [HTML5 geolocation prompt with optional IP lookup as a fallback](#geolocation-prompt)
* [Store locator API call](#store-locator-api-call)
* [ShopLocal API call](#shoplocal-api-call)
* [Google Maps](#google-maps)
	* [Geocoding](#geocoding)
	* [Map Draw](#map-draw)
* [Standard AJAX Requests](#standard-ajax-requests)
* [Image Tracker](#image-tracker)
* [Mobile and platform specific detection](#)
* [iOS version detection (namely for iOS 7)](#ios-version-detection)
* [Query string detection](#query-sring-detection)
* [Word Capitalization](#word-capitalization)
* [Email Validation](#email-validation)
* [Phone Number Validation](#phone-number-validation)
* [Zip Code Validation](#zip-code-validation)
* [Technical Support](#technical-support)

---

## How To Use

Place the JavaScript tag referencing the framework before any campaign specific code.  You may do this either in the head or inline.  We recommend you use the minified version for any non-development work.  For your convenience, we have a copy of the code on our CDN server you may use at http://mdn4.phluantmobile.net/jslib/pcf/.  Example tag:

```
<script src="http://mdn4.phluantmobile.net/jslib/pcf/pcf.min.js"></script>
```

All coding examples used in this documentation can utilize jQuery or other JavaScript framework library equivalents unless otherwise indicated.

[top](#phluant-client-framework-library)

---

### Element ID referencing

The ads we serve up can be placed on a web site or mobile application with multiple ad instances.  This function ensures any element ID referenced in the code will have the name-spacing attribute added to it if needed, with the standard ```document.getElementById()``` function being the fallback.

Example:

```
<script>
var contract_div = pcf.gid('contract_div');
var expand_div = pcf.gid('expand_div');
var expand_btn = pcf.gid('expand_btn');
var close_btn = pcf.gid('close_btn');
</script>
```

_Required for any campaign that will have multiple ad instances served, and is recommended in all other cases.  It's compatible when being used with jQuery or other JavaScript framework libraries._

[top](#phluant-client-framework-library)

---

### Initialization

This function initializes the framework for expandable ads and interstitial/banner ads that need close functionality.  It also initializes any MRAID specific functionality if the MRAID framework is detected.  The developer will need to ensure an appropriate callback function is designated for contracting/closing the ad.  If the callback function contains object function calls, the object must have an explicit reference.

Specs:

* callback: The close function for an expanded ad.  Required for any expandable ad running on MRAID.  Recommended in all cases.
* init: The initialization function for an ad.  Required for any ad running on MRAID.  Recommended in all cases.
* expanded: Default is false.  Only required for interstitial ads.

Example:

```
<script>
function contractAd(){
	expand_div.style.display = 'none';
	contract_div.style.display = 'block';
}

function initialize(){
	//Initialization code.
}

pcf.init({
	'callback': contractAd,
	'expanded': false,
	'init': initialize
});
</script>
```

_Required for all expandable ads, interstitial/banner ads that need close funcitonality, and any ad that will run in MRAID._

[top](#phluant-client-framework-library)

---

### Expands

This function receives the attributes of the ad in its expanded state, fires off the appropriate reporting tracker, and automatically handles any MRAID specific requirements.  For assets running outside of our ad serving network, a console log message will display the expansion properties.

Example:

```
<script>
expand_btn.addEventListener('click', function(){
	expand_div.style.display = 'block';
	contract_div.style.display = 'none';
	pcf.expand({
		'width': 320,
		'height': 416
	});
}
</script>
```

_Required for all expandable ads._

[top](#phluant-client-framework-library)

---

### Contracts

This function ensures our framework can properly close the ad, fires off the appropriate reporting tracker, automatically handle and MRAID specific requirements, and closes any video being played.  For assets running outside of our ad serving network, a console log message will outputted indicating 'contracting'.  Because the ad specific close function was already passed to the framework with the initialization, it's only necessary to call the framework function.

Example:

```
<script>
contract_btn.addEventListener('click', function(){
	pcf.contract();
});
</script>
```

_Requried for all expandable ads as well as interstitial/banner ads that require close functionality._

[top](#phluant-client-framework-library)

---

### Clickthroughs

This function ensures any user initiated clickthrough can be entered into our tracking system, and will open either a new browser tab (mobile web) or the mobile app's web viewer.  For assets running outside of our ad serving network, a console log message displaying the reporting name will be outputted.

Example of traditional hyperlink using the element ID as the reporting name:

```
<a id="clickthrough1" href="http://somesite.com">Clickthrough 1</a><br />
<a id="clickthrough2" href="http://othersite.com">Clickthrough 2</a>
<script>
var links = document.getElementsByTagName("a");
for (var i=0; i<links.length; i++){
    links[i].addEventListener("click", function (a){
    	a.preventDefault();
    	pcf.clickthru({
    		'url': links[i].href,
    		'name': links[i].id
    	});
    });
}
</script>
```

Example of using an element as a 'hotspot':

```
<div id="clickthrough"></div>
<script>
var clickthrough = pcf.gid('clickthrough');
clickthrough.addEventListener('click', function(){
	pcf.clickthru({
		'url': 'http://somesite.com',
		'name': 'clickthrough',
	});
});
</script>
```
_Required for all clickthroughs that are to be tracked, recommended in all other cases._

[top](#phluant-client-framework-library)

---

### Custom Trackers

This function ensures that a specialized event can be entered into our tracking system, i.e. a user navigating to a certain section of the ad.  For assets running outside of our ad serving network, a console log message displaying the reporting name will be outputted.

Example:

```
<ul>
	<li id="section1">Seciton 1</li>
	<li id="section2">Section 2</li>
</ul>
<div id="element1">
	Some content
</div>
<div id="element2">
	More content
</div>

<script>
var section1 = pcf.gid('section1');
var section2 = pcf.gid('section2');
var element1 = pcf.gid('element1');
var element2 = pcf.gid('element2');

section1.addEventListener('click', function(){
	element1.style.display = 'block';
	element2.style.display = 'none';
	pcf.track('element1Display');
});

section2.addEventListener('click', function(){
	element2.style.display = 'block';
	element1.style.display = 'none';
	pcf.track('element2Display');
});
</script>
```

[top](#phluant-client-framework-library)

---

### HTML5 Video

This function ensures that any HTML5 video that needs to be played can have the proper code rendered, inside or outside of Phluant's ad serving network.  It isn't necessary to include any video tags in the HTML.  All that is needed is a video container element and the proper JavaScript code.  It is also possible for a video to auto play on an expansion.  All that would be required is to add in the function call-up to the applicable expand code.  All videos automatically close on the completion of the video or contracting the ad.  For any other events that require closure, ```pcf.video_close()``` can be utilized.

Required Attributes:

* container_id: The DOM element ID for the video container.
* video_url: The URL for the video source.  Can be relative (same server) or absolute (remote server).

Optional Attributes:

* attributes.webkit-playsinline: Default is false.  Must be a boolean.  Some devices may not support inline video in certain environments.
* attributes.controls: Default is true.  Most be a boolean.
* attributes.autoplay: Default is true.  Mobile devices will not autoplay a video in a mobile web environment on initial load, but will autoplay on an ad expansion.
* attributes.xx: Any standard HTML5 video attribute can be utilized.
* aspect_ratio: Default is 16:9 and used if height or width of parent element can't be determined.  Can be overwritten.
* close_callback: Default is null.  A function can be specified to call up on the video ending.
* full_screen: Default is false.  Will expand to full screen if set to true on supported devices and will override webkit-playsinline.
* hide_close_button: Specific to ads running in Phluant's ad serving network.  Default is true.  Must be a boolean.
* pause_callback: Default is null.  A function can be specified to call up on the video pausing.
* play_callback: Default is null.  A function can be specified to call up on the video ending.
* reload: Default is false.  Phluant's video framework destroys the video instance by default.  Setting reload to true will override this.
* style.xx: Any native JavaScript styling attribute can be utilized.

Additional Notes:

* The video tag will take on the height and width of the parent container by default, so be sure these are set properly!  The default z-index is 5000.  These values can be overwritten.
* Be sure to utilize the ```pcf.videoPlaying``` boolean if using a click function call, as this will ensure the video isn't called multiple times.

Example:

```
<div id="video_container"></div>
<script>
var video_container = pcf.gid('video_container');
video_container.addEventListener('click', function(){
	if(!pcf.videoPlaying){
		pcf.video({
			'video_url': 'videos/somevideo.mp4',
			'container_id': video_container,
			'aspect_ratio': '16:9',
			'attributes':{
				'controls': true,
				'webkit-playsinline': true
			},
			'style':{
				'zIndex': 50000
			}
		});
	}
});
</script>
```

[top](#phluant-client-framework-library)

---

### Geolocation/Weather API calls

Phluant maintains a web based application capable of providing geolocation and weather information based on location, using Maxmind and National Weather Service resources respectively.  All lookups are done by AJAX and require the developer to specify a callback function to return the data. Please be aware the mobile data providers have a wide latitude in assigning IP addresses to users, which may return an inaccurate location.  If geocoordinates can't be obtained from the publisher and precise geocoordinates are needed, it's recommended to use the [HTML5 Geolocation Prompt](#geolocation-prompt).


#### Geolocation

Geolocation Lookup Methods:

* IP Address (default)
* Postal Code (US and Canadian only)
* City/Postal by Geo

IP Address code example:
```
<script>
function geoReturn(data){
	console.log(data);
}

pcf.geolocation({
	'callback': geoReturn,
});
</script>
```

Postal Code Example:

```
<script>
function geoReturn(data){
	console.log(data);
}

pcf.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'postal_code',
		'value': '98033'
	}
});
</script>
```

City/Postal by Geo Example:

```
<script>
function geoReturn(data){
	console.log(data);
}

pcf.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'city_postal_by_geo',
		'value': '47.6727,-122.1873'
	}
});
</script>
```

All geolocation lookup methods return the following data:

* data.results.country: The abbreviated country.
* data.results.state_region: The abbreviated state, province, or region.
* data.results.city: The full city name.
* data.results.lat: The centralized reported latitude of the postal code.
* data.results.lon: The centralized reported longitude of the postal code.
* data.results.dma_code:  The DMA code for the user’s current location.
* data.results.area_code:  The prevailing area code for the user’s current location.  This has no correlation to the user’s actual area code.

_For a comprehensive address lookup, please see the [Google Maps Geocoding](#geocoding) function._

#### Weather

Weather Lookup Methods:

* IP address (default)
* Postal code
* Lat/lng

Weather by IP Example:

```
<script>
function weatherReturn(data){
	console.log(data);
}

//The data.end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.
pcf.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'weather',
		'end': '3 days',
	}
});
</script>
```

Weather by Postal Code Example:

```
<script>
function weatherReturn(data){
	console.log(data);
}

//The data.end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.  The subtype spec must be specified as postal_code.
pcf.geolocation({
	'callback': weatherReturn,
	'data': {
		'type': 'weather',
		'subtype': 'postal_code',
		'value': '98033',
		'end': '3 days'
	}
});
</script>
```

Weather by Geolocation Example:

```
<script>
function weatherReturn(data){
	console.log(data);
}

//The data.end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.  The subtype spec must be specified as geo, and value is in lat,lng format.
pcf.geolocation({
	'callback': weatherReturn,
	'data': {
		'type': 'weather',
		'subtype': 'geo',
		'value': '47.676308399999996,-122.20762579999999',
		'end': '3 days',
	}
});
</script>
```


The weather data returned can vary based on custom input values.  The start_value_time and end_value_time attributes, if included, are in W3C format. An example response is provided below:

* data.status: the overall outcome of the query.  Is success or error.
* data.msg: An occasional message may appear if a particular outcome occurs.
* data.results city: The full city name.
* data.results.state_region: The abbreviated state, province, or region.
* data.results.postal_code: The postal code of the user’s location.
* data.results.lat: The centralized reported latitude of the postal code.
* data.results.lng: The centralized reported longitude of the postal code.
* data.results.nws_xml: The URL for the original NWS XML output.
* data.results.nws_page: The URL for a human friendly NWS weather report page.
* data.results.data.icon:  An array of weather icon images provided by the NWS.  Within each result contains the value, which is a hyperlink to the image, and start_valid_time.
* data.results.data.weather_conditions: An array of the weather conditions summary.  Within reach result contains the value, which is a human readable summary of the weather, and start_valid_time.
* data.results.data.maximum_temp: An array of the maximum daytime temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* data.results.data.minimum_temp: An array of the minimum daytime temperatures in fahrenheit. Within reach result contains the value, along with start_valid_time and end_valid_time.
* data.results.data.hourly_temp: An array of the hourly temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* data.results.data.precipitation:  An array of the expected levels of precipitation in inches.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.clould_cover:  An array of the expected cloud cover levels in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.12_hour_precip_prob:  An array of the likeliness of precipitation in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.humidity:  An array of the humidity in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.wind_dir:  An array of the wind directions at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.wind_speed:  An array of the wind speed at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.

[top](#phluant-client-framework-library)

---

### Store Locator API Call

This function provides certain clients the ability to pull store location information information for various ads, namely to display the closest number of stores in relation to the user.  If your campaign has been set up with this feature, this API call will work for you.  All lookups are done by AJAX and require the developer to specify a callback function to return the data.

Lookup Methods:

* IP address (default)
* Lat/lng
* Postal Code

Required Specs:

* callback - the callback function.
* data.campaign_id - the campaign ID assigned by Phluant.


Optional Specs:

* data.limit - the limit on the number of stores.  Default is 3.
* data.dist - the limit on the maximum radius distance in miles.  Default is 30.
* data.subtype - specify as geo or postal_code.
* data.value - if subtype is declared, use this spec to declare the value.

Store Location by IP Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Distance and limit are shown as an example and can be omitted if satisfied with default values
pcf.get_stores({
	'callback': storeReturn,
	'data': {
		'campaign_id': 9999,
		'limit': 3,
		'dist': 30
	}
});
</script>
```

Store Location by Geo Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Distance and limit are shown as an example and can be omitted if satisfied with default values.  Subtype and value must be specified for a geolocation lookup.
pcf.get_stores({
	'callback': storeReturn,
	'data': {
		'campaign_id': 9999,
		'limit': 3,
		'dist': 30,
		'subtype': 'geo',
		'value': '47.676308399999996,-122.20762579999999'
	}
});
</script>
```

Store Location by Postal Code Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Distance and limit are shown as an example and can be omitted if satisfied with default values.  Subtype and value must be specified for a geolocation lookup.
pcf.get_stores({
	'callback': storeReturn,
	'data': {
		'campaign_id': 9999,
		'limit': 3,
		'dist': 30,
		'subtype': 'postal_code',
		'value': '98033'
	}
});
</script>
```

[top](#phluant-client-framework-library)

---

### ShopLocal API Call

Because Phluant has an established relationship with ShopLocal, we are already set up to aggregate ShopLocal data to our ads. Any Phluant client with an established ShopLocal campaign can utilize this function to call in relevant ShopLocal store and category data.  Store and category data can be looked up all at once or separately.  All lookups are done by AJAX and require the developer to specify a callback function to return the data.  All data is returned in JavaScript object format.

Lookup Methods:

* IP address (default)
* Lat/lng
* Postal Code

Required Specs:

* callback - the callback function.
* data.campaignid - the campaign ID assigned by ShopLocal.  This is NOT the same campaign ID assigned by Phluant.
* data.company - the company name assigned by ShopLocal.


Optional Specs:

* data.subtype - For obtaining the user's location if an IP based lookup isn't desired.  Specify as geo or postal_code if desired.
* data.value - Set to applicable value if data.suptype is geo or postal_code.
* data.call_type - default is store.  While any number of different categories can potentially work, only retailertag has been fully tested with our system.  Separate multiple call types with a comma.  This spec will override the default.
* data.<category>ids - Used in conjunction with retailertag or any other category, and is required if the related category is set.  Separate multiple category id's with a comma.
* data.storeid - Used to look up categories from a specified store.  Please be aware that this value isn't necessary if the stores are being looked up along with a category, as the first store in the query result will override this value.
* listingcount - Default is 50.
* listingimagewidth - Default is 90.
* resultset - Default is full.
* sortby - Default is 6.
* data.pd - Used for some ShopLocal campaigns to override any date restrictions for development purposes.  This is a value assigned by ShopLocal.
* data.name_flag - If set, the system will watch out for any store name containing this value and remove it from the results.

ShopLocal by IP Example:

```
<script>
function shoplocalReturn(data){
	console.log(data);
}

//Optional values are shown as an example and can be omitted if satisfied with defaults.
pcf.shoplocal({
	'callback': storeReturn,
	'data': {
		'campaignid': 'abc123def456',
		'company': 'ABC, Inc.',
		'call_type': 'store,retailertag',
		'retailertagids': '2334'
	}
});
</script>
```

ShopLocal by Geo Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Optional values are shown as an example and can be omitted if satisfied with defaults.  Subtype and value must be specified for a geolocation lookup.
pcf.shoplocal({
	'callback': storeReturn,
	'data': {
		'campaignid': 'abc123def456',
		'company': 'ABC, Inc.',
		'call_type': 'store,retailertag',
		'retailertagids': '2334',
		'subtype': 'geo',
		'value': 'value': '47.676308399999996,-122.20762579999999'
	}
});
</script>
```

ShopLocal by Postal Code Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Optional values are shown as an example and can be omitted if satisfied with defaults.  Subtype and value must be specified for a geolocation lookup.
pcf.shoplocal({
	'callback': storeReturn,
	'data': {
		'campaignid': 'abc123def456',
		'company': 'ABC, Inc.',
		'call_type': 'store,retailertag',
		'retailertagids': '2334'
		'subtype': 'postal_code',
		'value': 'value': '98033'
	}
});
</script>
```

* The bulk of all store related data can be found in data.stores.results.collection.data.  Multiple locations may exist.
* The bulk of all category data, using retailertag as an example, can be found in data.retailertag.xxxx.results.collection[0][0].
* If an IP address or geolocation was used to calculate the user's address, the results will be returned.  The data can be found in data.user_info.results.

*Because ShopLocal return data can vary and this library is still in beta, we working on expanding the return data samples.*

[top](#phluant-client-framework-library)

---

### Geolocation Prompt

The function provides a means to prompt the user for their geo-coordinates.  A callback function must be included to receive the results, which are returned as a JavaScript object if the user approves, or a false boolean if the user declines.  The developer can optionally specify to use the [Geolocation IP lookup](#geolocation) as a failover and specify a failover callback.

Required Specs:
* callback - The callback function.

Optional Specs:
* failover - Set to true for the system to fail over to the Geolocation IP lookup.  Default is false.

Example:
```
<script>

function geoPromptReturn(data){
	console.log(data);
}

//Object attributes are only necessary if the failover feature is desired.
pcf.geolocation_prompt({
	'callback': geoPromptReturn,
	'failover': true,
});

</script>
```

[top](#phluant-client-framework-library)

---

### Google Maps

The following functions give a simplified method to utilize the Google Maps JavaScript API.  At present, both the geocoding and map drawing functions are supported.  Both features require the Google Maps JavaScript reference placed before the PCF reference, be it in the head or inline.  A callback function is also required. Example Google Maps JavaScript reference:

```
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
```

#### Geocoding

Returns Google Maps API information on a location.  May be a full or partial address, city/state, postal code, lat/lng values, etc. Specifying Phluant's [Geolocation](#geolocation) services as a failover is optional, and the system will detect to use the IP, Postal Code, or Lat/Lng lookup based on address format.  If the failover is not specified and Google doesn't return any data, a false boolean will be returned to the callback.

Required Specs:
* address - Full or partial address, city/state, postal code, lat/lng values, etc.
* callback - The callback function.

Optional Specs:
* failover - Default is false.  The system will determine which method to use based on the address qualities.
* loc_type - Default is address.  If set to geo, the library will do a reverse geocode so long as the address is set as lat,lng.  Google limits the number of reverse geocodes to 5 per page onload event, so use sparingly.
* failover_callback - If a different callback from the regular failover is desired.  Be aware that if this value isn't specified and failover is set to true, the failover data will be returned to the regular callback function.

Example:

```
<script>

function gmapsReturn(data){
	console.log(data);
}

function geoReturn(data){
	console.log(data);
}

pcf.gmaps_geo({
	'address': '98033',
	'callback': gmapsReturn,
	'failover': true,
	'failover_callback': geoReturn
});
</script>
```

For more information, please visit the about the [Google Maps Geocoder API page](https://developers.google.com/maps/documentation/javascript/geocoding).

_Per Google's API policy, this function is only to be used when populating a Google Map or to create an external clickthrough to Google Maps._

#### Map Draw

Uses relevant data to draw out a Google Map in a specified element.

Required specs:

* map_id - the element ID for the map.
* center_lat - the latitude for the map's central location.
* center_lng - the longitude for the map's central location.

Optional specs:

* map_zoom - the zoom level of the map.  Default is 10.
* markers - an object containing relevant information for any desired markers.
* user_lat - the latitude for the user's location.  Required for the default Google Maps clickthrough.
* user_lat - the longitude for the user's location.  Required for the default Google Maps clickthrough.
	* markers[i].lat - the latitude of the desired marker.  Required for marker to be set.
	* markers[i].lng - the longitude of the desired marker.  Required for marker to be set.
	* markers[i].clickthru - an object containing relevant information for any marker to be a clickthrough.  Default is a Google Maps hyperlink using the original lat/lng values as the start point and the lat/lng values as the end point
		* markers[i].clickthru.name - the name of the clickthrough, used for reporting.  Essentially the same functionality as a standard clickthrough.
		* markers[i].clickthru.url - An optional URL value that will override the default Google Maps link.
	* The Map Draw function supports all of the optional marker specifications.  For more detailed information,  please visit the [Google Maps Marker API page](https://developers.google.com/maps/documentation/javascript/markers).

Example:

```
<div id="google_map"></div>
<script>
var google_map = pcf.gid('google_map');
var mapOptions = {
	'lat': 47.676308399999996,
	'lng': -122.20762579999999,
	'map_id': google_map,
	'map_zoom': 10,
	'markers': [],
}
//Pretend the data variable is an object that contains store infromation.
for(var i in data.results){
	var numAdd = eval(i+1);
	mapOptions.markers.push({
		'lat': data.results[i].lat,
		'lng': data.results[i].lng,
		'title': data.results[i].name,
		'zIndex': numAdd,
		'clickthru': {
			'name': 'GoogleMaps'
		}
	});
}
pcf.gmaps_draw(mapOptions);
</script>
```

[top](#phluant-client-framework-library)

---

### Standard AJAX Requests

This function allows for AJAX requests.  Both GET and POST requests are supported.  Using Yahoo Query Language (YQL) is also supported for enhanced CORS capabilities.  If the expected return data is in 100% JSON or XML format, instructions can be passed to convert the data into a JavaScript object.  Using a callback function is optional, but will be necessary to use the response data. Unless explicitly specified in a campaign contract, Phluant is not responsible for ensuring cross-domain access or any other accessibility issue concerning a non-Phluant AJAX source.  YQL may not resolve all cross-domain access issues.

Required specs:

* url - The URL the request is being made to.

Optional specs:

* callback - The callback function for the data.
* yql - Default is false.  Set to either true, or list as an object to specify the format.
	* yql.format - Default is json if yql is utilized.  Can be changed to xml or any other YQL supported format.
* data - An object of any GET/POST key/value pairs needed to complete the request.
* method - Default is false.  Should only be set to true if the expected return data is JSON or XML.
* timeout - The timeout for the AJAX call.  Default is 10000 milliseconds.
* asynch - Default is true.  Set to false for synchronous AJAX calls.

Example:

```
<script>

 function ajaxReturn(data){
 	console.log(data);
 }

 pcf.ajax({
 	'url': 'http://somesite.com/get/some/data',
	 'yql': {
			'format': 'xml',
		},
 	'callback': ajaxReturn,
 	'json_return': 'true',
 	'method': 'GET',
 	'timeout': 10000,
 	'data': {
 		'foo': 'bar',
 		'getmy': 'data',
 	}
 });
 </script>
```

[top](#phluant-client-framework-library)

 ---

### Image tracker

 This function provides the ability to fire off 1x1 image trackers for custom events other than the initialization.  For code-based trackers, please utilize the [AJAX](#standard-ajax-requests) function.

Example:

```
<script>
pcf.image_tracker('http://somesite.com/1x1_image_gif');
</script>
```

[top](#phluant-client-framework-library)

 ---

### Mobile and Platform Specific Detection

This set of functions provides a method to detect if a mobile/tablet device is being used, along with specific type.  It will detect Android, Blackberry, iOS, Opera Mini, Windows Mobile, or if the user is using any of the previously mentioned platforms.  Returns null if the device isn't detected.

Example:

```
<script>
console.log(pcf.isMobile.Android());
console.log(pcf.isMobile.Blackberry());
console.log(pcf.isMobile.iOS());
console.log(pcf.isMobile.Opera());
console.log(pcf.isMobile.Windows());
console.log(pcf.isMobile.any());
</script>
```

[top](#phluant-client-framework-library)

---

### iOS version detection

This variable provides a method to detect what iOS version, if any, is being run.  This is namely for iOS 7, which currently has usability issues and bugs in the Safari browser.  Returns the numerical version if an iOS version, returns 0 for all other devices.

Example:

```
<script>
console.log(pcf.iosVersion);
</script>
```

[top](#phluant-client-framework-library)

---

### Query String Detection

This function detects and returns any query string keys and values as a JavaScript object.  Can be specified as JSON if desired.  It works when the URL has a standard query string format.  Returns false if no query string is detected.

Example URL:  http://somesite.com/index.html?foo=bar&getmy=data.

Example JavaScript:
```
<script>
var query_string = pcf.query_string();
//If JSON format is desired
var query_string_json = pcf.query_string(true);
console.log(query_string);
</script>
```

[top](#phluant-client-framework-library)

---

### Word Capitalization

This function returns a capitalized version of a specified word.

Example:
```
<script>
console.log(pcf.capitalize('jordan'));
</script>
```

[top](#phluant-client-framework-library)

---

### Email Validation

This function returns a regex result for a valid email format.

Example:
```
<script>
console.log(pcf.valid_email('somebody@somesite.com'));
</script>
```

[top](#phluant-client-framework-library)

---

### Phone Number Validation

This function returns a regex result for a valid North American phone number.  It will automatically strip out any non-numeric characters.

Example:
```
<script>
console.log(pcf.valid_phone('555-555-5555'));
</script>
```

[top](#phluant-client-framework-library)

---

### Zip Code Validation

This function returns a regex result for a valid US zip code, with both 5 digit and hyphenated 9 digit formats supported.

Example:
```
<script>
console.log(pcf.valid_zip('98034'));
</script>
```

[top](#phluant-client-framework-library)

---

### Technical Support

Phluant Mobile is committed to helping our clients in successfully using this framework to design and develop their mobile advertisements.  Please feel free to utilize this repository's [issue tracker](../../issues) for general feedback, feature requests, bug reports, tech support questions, etc.  See a bug and know how to fix it, or know how to make this repository better?  Please feel free to make a fork, make necessary modifications, and submit a pull request to us.

[top](#phluant-client-framework-library)

---

Copyright 2014 Phluant Mobile, Inc.  All rights reserved.  This framework library is intended for use by Phluant Mobile clients for designing and developing mobile advertisements intended for eventual use in Phluant's ad serving network.  All other use is strictly prohibited.
