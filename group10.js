// JavaScript code to create the map
var mapCreated = false;
var mapCreated2 = false; // ricat

var map, map2;

var legend = L.control({ 
    position: 'bottomright'
    // position : 'topleft'
});
addLegend();


// Define the maximum bounds for the map
const southWest = L.latLng(-90, -180); // Define the southwest corner
const northEast = L.latLng(90, 180); // Define the northeast corner
const bounds = L.latLngBounds(southWest, northEast); // Create a LatLngBounds object

/*
    Color Legend:
    Great: Magnitudes 8.0 or more #B30923
    Major: Range 7.0-7.9 #E03426
    Strong: Range 6.0-6.9 #EE671C
    Moderate: Range 5.0-5.9 #F89116
    Light: Range 4.0-4.9 #D1BD1C
    Minor: Range 2.0-3.9 #A3B71F
    Micro: Less than 2.0 #52A43C
*/


function toggleVisibility(show) {
    var elementsToToggle = document.querySelectorAll('#mapMeasure, #mapRegion, #zeroValueToggle, label[for="zeroValueToggle"], #yearSlider, #magnitudeSlider');
    elementsToToggle.forEach(function(element) {
        element.style.display = show ? 'block' : 'none';
    });
}

// Function to calculate logarithm of a number
function log10(val) {
    return Math.log(val) / Math.log(10);
}

function normalizeValue(value, min, max) {
    return (value - min) / (max - min);
}

// Function to determine color based on earthquake magnitude
function getColor(magnitude) {
    if (magnitude >= 8.0) {
        return "#B30923"; // Great
    } else if (magnitude >= 7.0 && magnitude < 8.0) {
        return "#E03426"; // Major
    } else if (magnitude >= 6.0 && magnitude < 7.0) {
        return "#EE671C"; // Strong
    } else if (magnitude >= 5.0 && magnitude < 6.0) {
        return "#F89116"; // Moderate
    } else if (magnitude >= 4.0 && magnitude < 5.0) {
        return "#D1BD1C"; // Light
    } else if (magnitude >= 2.0 && magnitude < 4.0) {
        return "#A3B71F"; // Minor
    } else {
        return "#52A43C"; // Micro
    }
}

// Function to create color legend
function addLegend() {

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [8.0, 7.0, 6.0, 5.0, 4.0, 2.0, 0],
            labels = ['Great', 'Major', 'Strong', 'Moderate', 'Light', 'Minor', 'Micro'],
            from, to;

        // div.innerHTML += '<h4>Earthquake Magnitude</h4>';
        // Loop through magnitude ranges and generate legend labels with colors
        for (var i = 0; i < magnitudes.length; i++) {
            from = magnitudes[i];
            to = magnitudes[i + 1];
        
            div.innerHTML +=
            '<i style="background:' + getColor(from + 0.1) + '"></i> ' + labels[i] + '<br>';         
        }

        return div;
    };
}

// Function to create circle markers using D3.js
function createMarkers(data) {
    var markers = L.markerClusterGroup();

    data.forEach(function (row) {
        var date = row.day + "-" + row.month + "-" + row.year;
        var time = row.hour + ":" + row.minute + ":" + row.second;

        var tooltipContent =
            "Date (DD-MM-YYYY): " +
            date +
            "<br>" +
            "Time (HH:MM:SS): " +
            time +
            "<br>" +
            "Location: " +
            row.location_name +
            "<br>" +
            " (Long: " +
            row.longitude +
            ", Lat: " +
            row.latitude +
            ")<br>" +
            "Tsunami Generated? " +
            row.flag_tsunami +
            "<br>" +
            "Damages incurred ($ Millions): " +
            row["Damage ($ Millions)"] +
            "<br>" +
            "Magnitude: " +
            row["Magnitude"];

        var latitude = parseFloat(row.latitude);
        var longitude = parseFloat(row.longitude);

        if (!isNaN(latitude) && !isNaN(longitude)) {
            // Set color based on magnitude
            var magnitude = parseFloat(row["Magnitude"]);
            var fillColor = getColor(magnitude);

            var circleMarker = L.circleMarker([latitude, longitude], {
                radius: 5,
                color: fillColor,
                fillColor: fillColor, // Set dynamic fill color based on magnitude
                fillOpacity: 0.8,
                // weight: 0, // Set the border weight to zero to remove the border
            }).bindTooltip(tooltipContent);

            markers.addLayer(circleMarker);
        } else {
            console.log(
                "Invalid Latitude: " +
                    row.latitude +
                    ", Longitude: " +
                    row.longitude
            );
            console.log("Row: ", row);
        }
    });

    return markers;
}

// Function to switch between maps based on tab click
function openMap1(evt, mapName) {

    // mapCreated2 = false;

    // Switch Between Map Options
    document.getElementById("map2").style.display = "none";
    document.getElementById("map").style.display = "block";
    
    // Log a message indicating which map tab was clicked
    console.log("Clicked on", mapName);

    // Remove 'active' class from all tab buttons
    var tabButtons = document.querySelectorAll(".tab button");
    tabButtons.forEach(function (button) {
        button.classList.remove("active");
    });

    // Add 'active' class to the clicked button
    evt.currentTarget.classList.add("active");

    // Add logic here to show elements when 'Full-Scale Map' tab is clicked
    toggleVisibility(false);

    /* ------------------------  Map1 Configuration ------------------------ */
    if (!mapCreated) {
        // Set up initial map center and zoom level using Leaflet
        map = L.map("map", {
            center: [0, 0], // Center of the map
            zoom: 2, // Initial zoom level
            scrollWheelZoom: false,
            tap: false,
            maxBounds: bounds, // Set the maximum bounds
            maxBoundsViscosity: 1.0, // How strong bounds are adhered to (1.0 for strict bounds)
            minZoom: 1, // Set the minimum allowed zoom level
        });

        // Control panel to display map layers
        var controlLayers = L.control
            .layers(null, null, {
                position: "topright",
                collapsed: false,
            })
            .addTo(map);

        var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);
        controlLayers.addBaseLayer(CartoDB_Voyager, "Carto Voyager");

        // Display Carto basemap tiles with light features and labels
        var light = L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            {
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution">CARTO</a>',
            }
        )
        controlLayers.addBaseLayer(light, "Carto Light");

        var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
            minZoom: 0,
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            ext: 'png'
        });
        controlLayers.addBaseLayer(Stadia_AlidadeSmoothDark, "Stadia Black");

        // Use D3 to fetch data and create circle markers
        d3.csv("./EarthquakeData.csv").then(function (data) {
            var markers = createMarkers(data);

            if (mapName == "page1") {
                // Add markers to the map
                map.addLayer(markers);
                legend.addTo(map);
            }
        });

        mapCreated = true;
    }
    
    // Reset SetView to Initial Position
    map.setView([0, 0], 2);

    /* ------------------------ Map1 Configuration ------------------------ */
}

function openMap2(evt, mapName) {

    // mapCreated = false;

    // Switch Between Map Options
    document.getElementById("map2").style.display = "block";
    document.getElementById("map").style.display = "none";

    // Log a message indicating which map tab was clicked
    console.log("Clicked on", mapName);

    // Remove 'active' class from all tab buttons
    var tabButtons = document.querySelectorAll(".tab button");
    tabButtons.forEach(function (button) {
        button.classList.remove("active");
    });

    // Add 'active' class to the clicked button
    evt.currentTarget.classList.add("active");
    
    // Add logic here to show elements when 'Full-Scale Map' tab is clicked
    toggleVisibility(true);

    /* ------------------------ Map2 Configuration ------------------------ */
    if(!mapCreated2){
        map2 = L.map("map2", {
            center: [0, 0], // Center of the map
            zoom: 2, // Initial zoom level
            scrollWheelZoom: true,
            tap: false,
            maxBounds: bounds, // Set the maximum bounds
            maxBoundsViscosity: 1.0, // How strong bounds are adhered to (1.0 for strict bounds)
            minZoom: 1, // Set the minimum allowed zoom level
        });
    
        var yearSlider = document.getElementById("yearSlider");
        noUiSlider.create(yearSlider, {
            start: [1921, 2020], // Initial range for the slider
            connect: true,
            step: 1,
            tooltips: true,
            format: {
                to: (v) => v | 0,
                from: (v) => v | 0,
            },
            range: {
                min: 1921,
                max: 2020,
            },
        });
    
        var magnitudeSlider = document.getElementById("magnitudeSlider");
        
        noUiSlider.create(magnitudeSlider, {
            start: [0, 9.5],
            range: {
                min: 0,
                max: 9.5,
            },
            connect: true,
            orientation: "vertical",
            direction: 'rtl',
            step: 0.1,
            tooltips: true,
            pips: {
                // mode: 'range',
                mode: 'values', // Show pips at specific values
                values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9.5], // Set the values where pips should appear
                density: 2, // Adjust density for pips at each 0.5 increment
                format: {
                    to: function (value) {
                        return value.toFixed(1); // Display one decimal place
                    },
                    from: function (value) {
                        return parseFloat(value); // Parse the value as a float
                    }
                }
            }
        });

        const zeroValueToggle = document.getElementById("zeroValueToggle");

        // Control panel to display map layers
        var controlLayers = L.control
            .layers(null, null, {
                position: "topright",
                collapsed: false,
            })
            .addTo(map2);

        var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map2);
        controlLayers.addBaseLayer(CartoDB_Voyager, "Carto Voyager");

        // Display Carto basemap tiles with light features and labels
        var light = L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            {
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution">CARTO</a>',
            }
        )
        controlLayers.addBaseLayer(light, "Carto Light");

        var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
            minZoom: 0,
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            ext: 'png'
        });
        controlLayers.addBaseLayer(Stadia_AlidadeSmoothDark, "Stadia Black");

        legend.addTo(map2);
        mapCreated2 = true;
    }
    /* ------------------------ Map2 Configuration ------------------------ */

    // Reset SetView to Initial Position
    map2.setView([0, 0], 2);
    

    // Load and process the earthquake CSV data
    fetch("EarthquakeData.csv")
        .then((response) => response.text())
        .then((data) => {
            // Parse CSV data using D3.js
            const earthquakeData = d3.csvParse(data);
            const years = earthquakeData.map((d) => +d.year);
            const uniqueRegions = Array.from(
                new Set(earthquakeData.map((d) => d.Regions))
            );
            // console.log(uniqueRegions);

            // Populate region dropdown options
            const regionDropdown = document.getElementById("mapRegion");
            uniqueRegions.forEach((region) => {
                const option = document.createElement("option");
                option.value = region;
                option.text = region;
                regionDropdown.appendChild(option);
            });

            // Function to update circle sizes based on selected measure
            function updateMap(
                measure,
                selectedRegion,
                yearRange,
                magnitudeRange,
                showZeroValues
            ) {
                let filteredData = earthquakeData;
                if (selectedRegion !== "All") {
                    filteredData = earthquakeData.filter(
                        (eq) => eq.Regions === selectedRegion
                    );
                }

                let min, max;
                if (measure === "Magnitude") {
                    min = 0;
                    max = 9;
                } else if (measure === "total_damage_millions_dollars") {
                    min = 0;
                    max = 220081;
                } else if (measure === "total_deaths") {
                    min = 0;
                    max = 316000;
                } else if (measure === "total_houses_destroyed") {
                    min = 0;
                    max = 5360000;
                } else if (measure === "total_injuries") {
                    min = 0;
                    max = 799000;
                } else if (measure === "total_missing") {
                    min = 0;
                    max = 43476;
                }
                // Calculate log-transformed bounds
                const logTransformedMin = log10(min + 1); // Adding 1 to avoid log(0)
                const logTransformedMax = log10(max);

                filteredData.forEach((eq) => {
                    const eqYear = +eq.year;
                    const eqMagnitude = +eq.Magnitude;
                    const measureValue = +eq[measure];
                    
                    var date = eq.day + "-" + eq.month + "-" + eq.year;

                    var roundedSeconds = Math.floor(eq.second); 

                    // Format the time HH:MM:SS with leading zeros
                    var time = `${eq.hour.toString().padStart(2, '0')}:${eq.minute.toString().padStart(2, '0')}:${roundedSeconds.toString().padStart(2, '0')}`;

                    var fillColor = getColor(eqMagnitude);

                    // Define color scheme for each map measure
                    const measureColorScheme = {
                        Magnitude: fillColor, 
                        total_injuries: '#5DADE2', 
                        total_damage_millions_dollars: '#F4D03F', 
                        total_deaths: '#58D68D',
                        total_houses_destroyed: '#AF7AC5', 
                        total_missing: '#EC7063', 
                    };

                    // Get the color for the current map measure
                    const measureColor = measureColorScheme[measure];
            
                    var tooltipContent =
                        "Date (DD-MM-YYYY): " + date + "<br>" +
                        "Time (HH:MM:SS): " + time + "<br>" +
                        "Location: " + eq.location_name + "<br>" +
                        "(Long: " + eq.longitude + ", Lat: " + eq.latitude + ")" + "<br>" +
                        "Tsunami Generated? " + eq.flag_tsunami;
                    
                    var measureText, measureScale;
                    if(measure === "Magnitude"){ measureText = "Earhquake Magnitude"; measureScale = 2;}
                    // if(measure === "Magnitude"){ measureScale = 2;}
                    else if(measure === "total_injuries") {measureText = "Number of Injuries"; measureScale = 1;}
                    else if(measure === "total_damage_millions_dollars"){ measureText = "Damage Incurred ($ Millions)"; measureScale = 1;}
                    else if(measure === "total_deaths"){ measureText = "Number of Deaths"; measureScale = 1;}
                    else if(measure === "total_houses_destroyed") {measureText = "Number of Houses Destroyed"; measureScale = 1;}
                    else if(measure === "total_injuries"){ measureText = "Number of Injuries"; measureScale = 1;}
                    else if(measure === "total_missing") {measureText = "Number of Missing Persons"; measureScale = 1;}
                    // console.log("measureText:", measureText);

                    
                    if (
                        eqYear >= yearRange[0] &&
                        eqYear <= yearRange[1] &&
                        eqMagnitude >= magnitudeRange[0] &&
                        eqMagnitude <= magnitudeRange[1] &&
                        (showZeroValues || measureValue !== 0)
                    ) {
                        // Apply logarithmic transformation
                        const logTransformedValue = log10(measureValue + 1); // Adding 1 to avoid log(0)

                        // Normalize log-transformed value
                        const normalizedValue = (logTransformedValue - logTransformedMin) / (logTransformedMax - logTransformedMin);

                        if(measure != "Magnitude"){
                            const circle2 = L.circleMarker(
                                [+eq.latitude, +eq.longitude],
                                {
                                    // radius: normalizedValue * 13 * measureScale, 
                                    radius: normalizedValue * 20 / measureScale, 
                                    fillColor: fillColor, 
                                    color: fillColor,
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.7,
                                }
                            ).bindTooltip(`${tooltipContent} 
                            <br> <span style="color:${getColor(eqMagnitude)}">Earhquake Magnitude: ${eqMagnitude}</span>
                            <br> <span style="color:${measureColor}">${measureText}: ${measureValue}</span>`
                            );
                            
                            // Add the marker to the map
                            circle2.addTo(map2);

                        } else {
                            const circle2 = L.circleMarker(
                                [+eq.latitude, +eq.longitude],
                                {
                                    // radius: normalizedValue * 13 * measureScale, 
                                    radius: normalizedValue * 20 / measureScale, 
                                    fillColor: fillColor, 
                                    color: fillColor,
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.7,
                                }
                            ).bindTooltip(`${tooltipContent} 
                            <br> <span style="color:${getColor(eqMagnitude)}">${measureText}: ${measureValue}</span>`
                            );
                            
                            // Add the marker to the map
                            circle2.addTo(map2);
                        }
                    }
                });
            }

            // Initial update using default measure (Magnitude)
            updateMap("Magnitude", "All", [1921, 2020], [0, 9.5], false);

            yearSlider.noUiSlider.on("update", function (values) {
                map2.eachLayer((layer) => {
                    if (layer instanceof L.CircleMarker) {
                        map2.removeLayer(layer); // Remove existing circles
                    }
                });

                const selectedMeasure = document.getElementById("mapMeasure").value;
                const selectedRegion = document.getElementById("mapRegion").value;
                const yearRange = values.map(Number); // Convert slider values to numbers

                const magnitudeRange = magnitudeSlider.noUiSlider.get().map(Number); // Include magnitude range

                const showZeroValues =
                    document.getElementById("zeroValueToggle").checked; // Include toggle state

                updateMap(
                    selectedMeasure,
                    selectedRegion,
                    yearRange,
                    magnitudeRange,
                    showZeroValues
                );
            });

            magnitudeSlider.noUiSlider.on("update", function (values) {
                map2.eachLayer((layer) => {
                    if (layer instanceof L.CircleMarker) {
                        map2.removeLayer(layer); // Remove existing circles
                    }
                });

                const selectedMeasure = document.getElementById("mapMeasure").value;
                const selectedRegion = document.getElementById("mapRegion").value;
                const yearRange = yearSlider.noUiSlider.get().map(Number);
                const magnitudeRange = values.map(Number); // Convert slider values to numbers

                const showZeroValues =
                    document.getElementById("zeroValueToggle").checked; // Include toggle state

                updateMap(
                    selectedMeasure,
                    selectedRegion,
                    yearRange,
                    magnitudeRange,
                    showZeroValues
                );
            });

            zeroValueToggle.addEventListener("change", function () {
                map2.eachLayer((layer) => {
                    if (layer instanceof L.CircleMarker) {
                        map2.removeLayer(layer); // Remove existing circles
                    }
                });
                const selectedMeasure = document.getElementById("mapMeasure").value;
                const selectedRegion = document.getElementById("mapRegion").value;
                const yearRange = yearSlider.noUiSlider.get().map(Number);
                const magnitudeRange = magnitudeSlider.noUiSlider.get().map(Number);

                updateMap(
                    selectedMeasure,
                    selectedRegion,
                    yearRange,
                    magnitudeRange,
                    this.checked
                );
            });

            // Event listener for dropdown change
            document
                .getElementById("mapMeasure")
                .addEventListener("change", function () {
                    map2.eachLayer((layer) => {
                        if (layer instanceof L.CircleMarker) {
                            map2.removeLayer(layer); // Remove existing circles
                        }
                    });
                    const selectedMeasure = this.value;
                    // console.log(selectedMeasure);
                    const selectedRegion =
                        document.getElementById("mapRegion").value;
                    const yearRange = yearSlider.noUiSlider.get().map(Number);

                    const magnitudeRange = magnitudeSlider.noUiSlider
                        .get()
                        .map(Number); // Include magnitude range

                    const showZeroValues =
                        document.getElementById("zeroValueToggle").checked; // Include toggle state

                    updateMap(
                        selectedMeasure,
                        selectedRegion,
                        yearRange,
                        magnitudeRange,
                        showZeroValues
                    );
                });

            document
                .getElementById("mapRegion")
                .addEventListener("change", function () {
                    map2.eachLayer((layer) => {
                        if (layer instanceof L.CircleMarker) {
                            map2.removeLayer(layer); // Remove existing circles
                        }
                    });
                    const selectedMeasure =
                        document.getElementById("mapMeasure").value;
                    const selectedRegion = this.value;
                    const yearRange = yearSlider.noUiSlider.get().map(Number);

                    const magnitudeRange = magnitudeSlider.noUiSlider
                        .get()
                        .map(Number); // Include magnitude range

                    const showZeroValues =
                        document.getElementById("zeroValueToggle").checked; // Include toggle state

                    updateMap(
                        selectedMeasure,
                        selectedRegion,
                        yearRange,
                        magnitudeRange,
                        showZeroValues
                    );
                });
        })
        .catch((error) => {
            console.error("Error fetching earthquake data:", error);
        });
    }