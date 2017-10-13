var map;
var placeInfo;

var mapOptions = {
  center: {
    lat: 37.3280539,
    lng: -121.893297
  },
  zoom: 12,
};
map = new google.maps.Map(document.getElementById('map'), mapOptions);

placeInfo = new google.maps.InfoWindow({
  maxWidth: 220
});
//this function return image for a place
var getImgeFormStreetView = function(street, city) {
  return '<img class="streetview" src="http://maps.googleapis.com/maps/api/streetview?size=180x180&location=' + street + ', ' + city + '">';
};
//main ViewModel
var ViewModel = function() {

  var self = this;

  // represent a single place
  self.place = function(name, lat, lng, street, city) {

    var current = this;

    //place info
    current.name = ko.observable(name);
    current.lat = ko.observable(lat);
    current.lng = ko.observable(lng);
    current.street = ko.observable(street);
    current.city = ko.observable(city);

    //place image
    current.img = ko.observable(getImgeFormStreetView(street, city));

    //wiki links list
    current.wikilist = ko.observable('');

    // wiki API request
    var searchUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" + current.name() + "&format=json&callback=wikiCallBack";
    var listHTML ="<ul>links</ul>";
      var requestTimeout = setTimeout(function() {
        current.wikiUrl('request error');
      },2000);

      $.ajax({
				url: searchUrl,
				dataType: 'jsonp',
				success: function(response){
          var links = response[1];

          if (links.length === 0) {
            current.wikilist('can not find links');
          }else {
            var listElements = '';
            for (var i = 0; i < links.length; i++) {
              var url = "http://en.Wikipedia.org/wiki/ "+ links[i];
              var HTMLurl = '<li><a href="' + url + '">' + links[i] + '</a></li>';
              listElements = listElements.concat(HTMLurl);
              if(i === 3) break;
            }
             listHTML = listHTML.replace('links',listElements);

            current.wikilist(listHTML);
          }
          clearTimeout(requestTimeout);
        }
    });


    //compute place information
    current.information = ko.computed(function() {
      var infoHTML = "<div>" + '<h4 class="place-name">' + current.name() + '</h4>' + "<span>" + 'Wikipedia links:<br>'+ current.wikilist()+ "</span><br> street View image:" + current.img() + "</div>";
      return infoHTML;
    });

    //Create a marker on the map
    current.mapMarker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      animation: google.maps.Animation.DROP,
      title: name,
    });

    current.mapMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');

    current.showPlaceInfo = function() {
      map.setCenter(current.mapMarker.getPosition());
      placeInfo.setContent(current.information());
      placeInfo.open(map, current.mapMarker);

      self.myPlaces.forEach(function(place) {
        place().mapMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
      });
      current.mapMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
    };
    // google maps event listener to show place info and change marker color
    google.maps.event.addListener(current.mapMarker, 'click', function() {
      current.showPlaceInfo();
    });

    current.mapMarker.setMap(map);

  };

  // represent  all places
  self.myPlaces = [
    ko.observable(new self.place("The Tech Museum of Innovation", 37.3314642, -121.8903441, "S Market St", "San Jose,CA")),
    ko.observable(new self.place("Target", 37.3389807, -121.9045037, "Autumn Pkwy", "San Jose,CA")),
    ko.observable(new self.place("Starbucks Cafe", 37.3334056,-121.8874031, "S 2nd St", "San Jose,CA")),
    ko.observable(new self.place("SUBWAY Restaurants", 37.3338961, -121.887609, "S 2nd St", "San Jose,CA")),
    ko.observable(new self.place("Japanese American Museum of San Jose", 37.3475002, -121.8937821, "N 5th St", "San Jose,CA"))
  ];
  //array for all streets
  self.streets = ko.observableArray();
  self.streets.push('select street');
  self.myPlaces.forEach(function(place) {

    if (!self.streets().includes(place().street())){
      self.streets.push(place().street());
    }

  });
  //selected Street on the dropdown menu
  self.selectedStreet = ko.observable();

  //filter places by street
  self.places = ko.computed(function() {

    var filtered = ko.observableArray();

    self.myPlaces.forEach(function(place) {

      if (place().street() === self.selectedStreet() || self.selectedStreet() === 'select street') {
        place().mapMarker.setVisible(true);
        filtered.push(place());
      } else {
        place().mapMarker.setVisible(false);
      }

    });

    return filtered();
  });

};

$(function() {
  ko.applyBindings(new ViewModel());
});
