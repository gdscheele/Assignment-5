angular.module('listings').controller('ListingsController', ['$scope', '$location', '$stateParams', '$state', 'Listings', 
  function($scope, $location, $stateParams, $state, Listings){
    $scope.find = function() {
      /* set loader*/
      $scope.loading = true;

      /* Get all the listings, then bind it to the scope */
      Listings.getAll().then(function(response) {
        $scope.loading = false; //remove loader
        $scope.listings = response.data;
      }, function(error) {
        $scope.loading = false;
        $scope.error = 'Unable to retrieve listings!\n' + error;
      });
    };

    $scope.findOne = function() {
      $scope.loading = true;

      /*
        Take a look at 'list-listings.client.view', and find the ui-sref attribute that switches the state to the view 
        for a single listing. Take note of how the state is switched: 

          ui-sref="listings.view({ listingId: listing._id })"

        Passing in a parameter to the state allows us to access specific properties in the controller.

        Now take a look at 'view-listing.client.view'. The view is initialized by calling "findOne()". 
        $stateParams holds all the parameters passed to the state, so we are able to access the id for the 
        specific listing we want to find in order to display it to the user. 
       */

      var id = $stateParams.listingId;

      Listings.read(id)
              .then(function(response) {
                $scope.listing = response.data;
                $scope.loading = false;
              }, function(error) {  
                $scope.error = 'Unable to retrieve listing with id "' + id + '"\n' + error;
                $scope.loading = false;
              });
    };  

    $scope.create = function(isValid) {
      $scope.error = null;

      /* 
        Check that the form is valid. (https://github.com/paulyoder/angular-bootstrap-show-errors)
       */
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      /* Create the listing object */
      var listing = {
        name: $scope.name, 
        code: $scope.code, 
        address: $scope.address
      };

      /* Save the article using the Listings factory */
      Listings.create(listing)
              .then(function(response) {
                //if the object is successfully saved redirect back to the list page
                $state.go('listings.list', { successMessage: 'Listing succesfully created!' });
              }, function(error) {
                //otherwise display the error
                $scope.error = 'Unable to save listing!\n' + error;
              });
    };

    $scope.update = function(isValid) {
      /*
        Fill in this function that should update a listing if the form is valid. Once the update has 
        successfully finished, navigate back to the 'listing.list' state using $state.go(). If an error 
        occurs, pass it to $scope.error. 
       */
      var id = $stateParams.listingId;

      Listings.read(id)
          .then(function(response) {
            $scope.listing = response.data;
            console.log($scope.listing);
            $scope.loading = false;
          }, function(error) {
            $scope.error = 'Unable to retrieve listing with id "' + id + '"\n' + error;
            $scope.loading = false;
          });

      if(isValid) {
        Listings.update(id, $scope.listing)
            .then(function(response) {
              console.log('success');
              //if the object is successfully saved redirect back to the list page
              $state.go('listings.list', { successMessage: 'Listing succesfully updated!' });
            }, function(error) {
              //otherwise display the error
              $scope.error = 'Unable to update listing!\n' + error;
            });
      }
    };

    $scope.remove = function() {
      /*
        Implement the remove function. If the removal is successful, navigate back to 'listing.list'. Otherwise, 
        display the error. 
       */
      var id = $stateParams.listingId;

      Listings.read(id)
          .then(function(response) {
            $scope.listing = response.data;
            console.log($scope.listing);
            $scope.loading = false;
          }, function(error) {
            $scope.error = 'Unable to retrieve listing with id "' + id + '"\n' + error;
            $scope.loading = false;
          });

        Listings.delete(id)
            .then(function(response) {
              //if the object is successfully saved redirect back to the list page
              $state.go('listings.list', { successMessage: 'Listing succesfully deleted!' });
            }, function(error) {
              //otherwise display the error
              $scope.error = 'Unable to delete listing!\n' + error;
            });
    };

    $scope.initMap = function() {
      Listings.getAll().then(function(response) {
        $scope.loading = false; //remove loader
        $scope.listings = response.data;

        var infowindow = new google.maps.InfoWindow();
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: {lat: 29.643354, lng: -82.346198} //uf coordinates
        });

        $scope.listings.forEach(function(item) {
          if(item.coordinates) {
            var myLatLng = {lat: item.coordinates.latitude, lng: item.coordinates.longitude};

            var marker = new google.maps.Marker({
              position: myLatLng,
              map: map,
              title: item.name
            });

            google.maps.event.addListener(marker, 'click', function() {
              infowindow.setContent(
                  "<table>" +
                      "<tr>" +
                        "<td>" +
                          "<label>Name:</label>" +
                        "</td>" +
                        "<td>" +
                        item.name +
                        "</td>" +
                      "</tr>" +
                      "<tr>" +
                        "<td>" +
                          "<label>Code:</label>" +
                        "</td>" +
                        "<td>" +
                        item.code +
                        "</td>" +
                      "</tr>" +
                      "<tr>" +
                        "<td>" +
                          "<label>Address:</label>" +
                        "</td>" +
                        "<td>" +
                        item.address +
                        "</td>" +
                      "</tr>" +
                  "</table>"
              );
              infowindow.open(map, marker);
            });
          }
        });



      }, function(error) {
        $scope.loading = false;
        $scope.error = 'Unable to retrieve listings!\n' + error;
      });




    };

    /* Bind the success message to the scope if it exists as part of the current state */
    if($stateParams.successMessage) {
      $scope.success = $stateParams.successMessage;
    }

    /* Map properties */
    $scope.map = {
      center: {
        latitude: 29.65163059999999,
        longitude: -82.3410518
      }, 
      zoom: 14
    }
  }
]);