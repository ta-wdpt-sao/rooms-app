$(function(){
  if($('#address').length > 0){
    const geocoder = new google.maps.Geocoder();

    $('#address').on('blur', function () {
      geocodeAddress(geocoder);
    });

    function geocodeAddress(geocoder, resultsMap) {
      let address = $('#address').val();
    
      geocoder.geocode({ 'address': address }, function (results, status) {
    
        if (status === 'OK') {
          $('#latitude').val(results[0].geometry.location.lat());
          $('#longitude').val(results[0].geometry.location.lng());
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  }
});
