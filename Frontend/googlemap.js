function initMap() {

    // Bhopal Coordinates
    const bhopal = {
        lat: 23.2599,
        lng: 77.4126
    };

    // Create Map
    const map = new google.maps.Map(
        document.getElementById("cabifyMap"),
        {
            center: bhopal,
            zoom: 12,

            styles: [
                {
                    "elementType": "geometry",
                    "stylers": [{ "color": "#0f172a" }]
                },
                {
                    "elementType": "labels.text.stroke",
                    "stylers": [{ "color": "#0f172a" }]
                },
                {
                    "elementType": "labels.text.fill",
                    "stylers": [{ "color": "#94a3b8" }]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [{ "color": "#1e293b" }]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{ "color": "#020617" }]
                }
            ]
        }
    );

    // Marker
    const marker = new google.maps.Marker({
        position: bhopal,
        map: map,
        title: "Cabify Bhopal"
    });

    // Remove Placeholder
    const panel = document.getElementById("mapPanel");

    if (panel) {
        panel.classList.add("ready");
    }

    // Click on map
    map.addListener("click", (event) => {

        const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };

        // New marker
        new google.maps.Marker({
            position: clickedLocation,
            map: map
        });

        console.log(
            "Latitude:",
            clickedLocation.lat,
            "Longitude:",
            clickedLocation.lng
        );
    });
}