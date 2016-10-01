var FoursquareTrends = {

   url_tmpl: "https://api.foursquare.com/v2/venues/trending" 
              + "?ll={{lat}},{{lon}}&radius={{radius}}"
              + "&limit=10"
              + "&client_id={{client_id}}&client_secret={{client_secret}}"
              + "&v={{date}}"
              + "&callback=?",

   props:  {
      "client_id": "BCXMDD4NPQXSFJCDRLU1XSQDNPIIXFRQDOOHESBXR0HDFKDN",
      "client_secret": "CP1FYYHLNOT2BVWTHVJ1I53NCB3TNCWYCOELM4YC534HFTPP",
      "callback": "sq_response",
      "radius": "24000",
   },

   initialize: function() {

     var today = new Date();
     this.props['date'] = today.getFullYear() + today.getMonth() + today.getDate();

   },

   request: function(lat, lon) {
      // new request to foursquare

      this.props['lat'] = lat;
      this.props['lon'] = lon;

      var url = Mustache.render(this.url_tmpl, this.props);

      $.ajax({
         url: url, 
         context: this,
         dataType: "jsonp",
         success: this.response
      });
   },

   response: function(data) {
      var items = data.response.venues;

      $.each(items, function(i, item) {
         _tmpl = $("#li_tmpl").html();
         $("ul#trending").append(Mustache.render(_tmpl, item));
      });

      $.map(items, FoursquareTrends.instagramify);
   },

   instagramify: function(item) {
      InstagramStream.locationIdFromFoursquareId(item.id);
   }

}

var InstagramStream = {

   getIdUrl: "https://api.instagram.com/v1/locations/search?"
             + "foursquare_v2_id={{foursquareId}}"
             + "&client_id={{clientId}}"
             + "&callback=?",

   mediaUrl: "https://api.instagram.com/v1/locations/{{locationId}}/media/recent?"
             + "client_id={{clientId}}"
             + "&callback=?",

   clientId: "97d4f49a2f19491dbf47c4431c310764",


   locationIdFromFoursquareId: function(id) {

      var url = Mustache.render(this.getIdUrl, 
            { 
               foursquareId: id,
               clientId: this.clientId
            });

      $.ajax({
         url: url, 
         context: this,
         dataType: "jsonp",
         success: function(resp) { 
                     if(resp.data.length > 0) {
                        this.recentMediaForLocation(resp.data[0].id, id);
                     } else {
                        console.log("No instagram location found for 4sq key:", id);
                     }
                  }
      });
   },

   recentMediaForLocation: function(locationId, foursquareId) {
      
      var url = Mustache.render(this.mediaUrl, 
            { 
               locationId: locationId,
               clientId: this.clientId
            });

      $.ajax({
         url: url, 
         context: this,
         dataType: "jsonp",
         success: function(resp) { 
                     this.renderMedia(resp, foursquareId);
         }
      });
                                 
   },

   renderMedia: function(recentMedia, foursquareId) {

      var _tmpl = $("#_recentMediaItem").html();

      var items = recentMedia.data;
      console.log(items);

      $.each(items, function(i, item) {
         var container = $("#" + foursquareId + "_images");
         $(container).append(Mustache.render(_tmpl, item));
      });
   }
}

function error(error)
{
   switch(error.code) 
   {
      case error.TIMEOUT:
         alert ('Timeout');
         break;
      case error.POSITION_UNAVAILABLE:
         alert ('Position unavailable');
         break;
      case error.PERMISSION_DENIED:
         alert ('Permission denied');
         break;
      case error.UNKNOWN_ERROR:
         alert ('Unknown error');
         break;
   }
}
