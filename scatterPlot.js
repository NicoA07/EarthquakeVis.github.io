// Function to create scatterplot
function createScatterPlot(width, height) {
    // Load the CSV file using D3.js
    d3.csv("EarthquakeData.csv").then((data) => {
        // Parse the data
        const parsedData = data.map((d) => ({
            year: +d.year,
            magnitude: +d.Magnitude,
            location_name: d.location_name,
            longitude: +d.longitude,
            latitude: +d.latitude,
            flag_tsunami: d.flag_tsunami,
        }));

        // Remove existing SVG to redraw
        d3.select("#scatterPlot svg").remove();
        d3.select(".tooltip").remove();

        const colorScale = d3
            .scaleThreshold()
            .domain([2, 4, 5, 6, 7, 8])
            .range([
                "#52A43C",
                "#D1BD1C",
                "#F89116",
                "#EE671C",
                "#E03426",
                "#B30923",
            ]);

        // Update SVG container dimensions
        const svg = d3
            .select("#scatterPlot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Append title
        const title = svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - (margin.top/2))
            .attr("text-anchor", "middle")
            .style("font-size", "1.5em")
            .style("font-family", "Cutive Mono, sans-serif")
            .style("font-weight", "bold")
            .text("Significant Earthquakes Over 100 Years");

        // Append subtitle
        const subtitle = svg.append("text")
            .attr("x", width / 2)
            .attr("y",  0 - (margin.top/2) + 20)
            .attr("text-anchor", "middle")
            .style("font-size", "1em")
            .style("font-family", "Cutive Mono, sans-serif")
            .text("Hover over Earthquakes for Details");

        // Create scales for x and y axes
        const xScale = d3
            .scaleLinear()
            .domain([
                d3.min(parsedData, (d) => d.year),
                d3.max(parsedData, (d) => d.year),
            ])
            .range([0, width]);

        const yScale = d3
            .scaleLinear()
            .domain([
                d3.min(parsedData, (d) => d.magnitude),
                d3.max(parsedData, (d) => d.magnitude),
            ])
            .range([height, 0]);

        // Create x and y axes
        const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft().scale(yScale);

        // Append x and y axes to the SVG
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .selectAll("text") 
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .style("font-size", "14px") 
            .attr("transform", "rotate(-65)");


        // Append x-axis label
        svg.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 45})`) 
            .style("text-anchor", "middle")
            .text("Year");

        const yAxisG = svg.append("g")
            .call(yAxis)
            .style("font-size", "14px"); 
            
        // Append y-axis label
        svg.append("text")
            .attr("transform", `translate(${-margin.left + 200}, ${height / 2}) rotate(-90)`)
            .style("text-anchor", "middle")
            .text("Magnitude");
        
        // Apply CSS to hide y-axis line
        yAxisG.select(".domain")
            .style("display", "none");

        // Create circles for the scatterplot points
        const circles = svg
            .selectAll("circle")
            .data(parsedData)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.year))
            .attr("cy", (d) => yScale(d.magnitude))
            .attr("r", 3.5) // Radius of the circle
            .style("fill", (d) => colorScale(d.magnitude))
            .style("opacity", 0.5);

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "#f0f0f0")
            .style("border", "1px solid #333")
            .style("padding", "10px");

        circles.on("mouseover", function (event, d) {
            const tooltipContent =
                "Year: " +
                d.year +
                "<br>" +
                "Location: " +
                d.location_name +
                "<br>" +
                "Coordinates (Long: " +
                d.longitude +
                ", Lat: " +
                d.latitude +
                ")" +
                "<br>" +
                "Tsunami Generated? " +
                d.flag_tsunami +
                "<br>" +
                "Magnitude: " +
                d.magnitude;

            tooltip
                .html(tooltipContent)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 30 + "px")
                .style("opacity", 0.9);
        });

        circles.on("mouseout", function () {
            tooltip.style("opacity", 0);
        });
    });
}

// Function to update dimensions on window resize
function updateDimensions() {

    // Set up updated SVG dimensions
    const margin = { top: 70, right: 100, bottom: 100, left: 250 };
    const width = window.innerWidth * 0.9 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Call createScatterPlot function with updated dimensions
    createScatterPlot(width, height);
}

// Call the createScatterPlot function initially
const margin = { top: 70, right: 100, bottom: 100, left: 250 };
const initialWidth = window.innerWidth * 0.9 - margin.left - margin.right;
const initialHeight = 600 - margin.top - margin.bottom;
createScatterPlot(initialWidth, initialHeight);

// Call the function whenever the window size changes
window.addEventListener("resize", updateDimensions);