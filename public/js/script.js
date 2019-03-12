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

    if($('#map').length > 0) {
        const markers = [];
        const bounds = new google.maps.LatLngBounds();

        const saoPaulo = {
            lat: -23.56173216,
            lng: -46.6623271
        };

        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: saoPaulo
        });

        $('.map-marker').each(function(){
            const center = {
              lat: $(this).data('lat'),
              lng: $(this).data('lng')
            };
            bounds.extend(center);
            const pin = new google.maps.Marker({
              position: center,
              map: map
            });
            markers.push(pin);
            map.setCenter(center);
        });

        if(markers.length > 1) {
            map.fitBounds(bounds);
        }
    }

    $('.rating a').click(function(e){
        e.preventDefault();

        let rating = $(this).data('rating');

        $(this).parents('.rating').attr('class', 'rating rating-' + rating);
        $(this).parents('.rating').find('input').val(rating);
    });
});
