d3.csv("EarthquakeData.csv").then((data) => {
    const parsedData = data.map((d) => ({
        magnitude: +d.Magnitude,
    }));

    const histogramData = [
        { range: "2.0", max: 0.0, count: 0 },
        { range: "3.0", max: 1.9, color: "#52A43C", count: 0 },
        { range: "4.0", min: 2.0, max: 3.9, color: "#A3B71F", count: 0 },
        { range: "5.0", min: 4.0, max: 4.9, color: "#D1BD1C", count: 0 },
        { range: "6.0", min: 5.0, max: 5.9, color: "#F89116", count: 0 },
        { range: "7.0", min: 6.0, max: 6.9, color: "#EE671C", count: 0 },
        { range: "8.0", min: 7.0, max: 7.9, color: "#E03426", count: 0 },
        { range: "9.0", min: 8.0, color: "#B30923", count: 0 },
        { range: "10.0", max: 0.0, count: 0 },
    ];

    parsedData.forEach((d) => {
        histogramData.forEach((range) => {
            if (
                (range.hasOwnProperty("min") && range.hasOwnProperty("max") &&
                    d.magnitude >= range.min && d.magnitude <= range.max) ||
                (range.hasOwnProperty("max") && d.magnitude < range.max)
            ) {
                range.count++;
            }
        });
    });

    const histogramWidth = window.innerWidth*0.2;
    const histogramHeight = 250;
    const histogramMargin = { top: 50, right: 10, bottom: 30, left: 240 };

    const histogramSvg = d3
        .select("#histogramPlot")
        .append("svg")
        .attr(
            "width",
            histogramWidth + histogramMargin.left + histogramMargin.right
        )
        .attr(
            "height",
            histogramHeight + histogramMargin.top + histogramMargin.bottom
        )
        .append("g")
        .attr(
            "transform",
            `translate(${histogramMargin.left},${histogramMargin.top})`
        );

    // Append title
    const title = histogramSvg.append("text")
        .attr("x", histogramWidth / 2)
        .attr("y", 0 - (histogramMargin.top/2))
        .attr("text-anchor", "middle")
        .style("font-size", "1em")
        .style("font-family", "Cutive Mono, sans-serif")
        .style("font-weight", "bold")
        .text("Earthquake Distribution Over 100 Years");

    // Append subtitle
    const subtitle = histogramSvg.append("text")
        .attr("x", histogramWidth / 2)
        .attr("y",  0 - (histogramMargin.top/2) + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "0.8em")
        .style("font-family", "Cutive Mono, sans-serif")
        .text("Hover over Earthquakes for Details");

    const xHistogramScale = d3
        .scaleBand()
        .domain(histogramData.map((d) => d.range))
        .range([0, histogramWidth])
        .padding(0.1);

    const maxCount = d3.max(histogramData, (d) => d.count);

    const yHistogramScale = d3
        .scaleLinear()
        .domain([0, maxCount])
        .nice()
        .range([histogramHeight, 0]);

    const xAxisHistogram = d3.axisBottom(xHistogramScale);

    // Create a tooltip
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "#f0f0f0")
        .style("border", "1px solid #333")
        .style("padding", "10px");

    histogramSvg
        .append("g")
        .attr("transform", `translate(0, ${histogramHeight})`)
        .call(xAxisHistogram)
        .selectAll("text")
        .attr("dy", "1em")
        .style("text-anchor", "end");

    // Update the attributes of the bars to include tooltip functionality
    histogramSvg
        .selectAll("rect")
        .data(histogramData)
        .enter()
        .append("rect")
        .attr("x", (d) => xHistogramScale(d.range))
        .attr("y", (d) => yHistogramScale(d.count))
        .attr("width", xHistogramScale.bandwidth() - 0.8)
        .attr("height", (d) => histogramHeight - yHistogramScale(d.count))
        .attr("fill", (d) => d.color)
        .style("opacity", 0.8)
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(100).style("opacity", 0.9);
            tooltip
                .html(`Magnitude Range: ${d.range}<br>Occurrences: ${d.count}`)
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });
});
