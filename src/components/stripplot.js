// Import D3 and FileAttachment
import * as d3 from "npm:d3";
import { FileAttachment } from "npm:@observablehq/stdlib";

//Load Data
const data = await FileAttachment("../data/iris.csv").csv();

// Specify the chart’s dimensions.
const width = 928;
const height = 600;
const margin = {
  top: 25,
  bottom: 35,
  right: 20,
  left: 40,
};

// Create the positional scales.

const x = d3.scaleOrdinal(d3.group(data, (d) => d.species).keys(), [
  margin.left + 0.25 * (width - margin.right),
  margin.left + 0.5 * (width - margin.right),
  margin.left + 0.75 * (width - margin.right),
]);

// define the jitter randomizer
const jitter = d3.randomUniform(15);

const y = d3
  .scaleLinear()
  .domain(d3.extent(data, (d) => d.sepalWidth))
  .nice()
  .range([height - margin.bottom, margin.top]);

// Create the color scale.
const color = d3.scaleOrdinal(
  d3.group(data, (d) => d.species).keys(),
  d3.schemeCategory10
);

// Create the SVG container.
const svg = d3
  .create("svg")
  .attr("viewBox", [0, 0, width, height])
  .attr("width", width)
  .attr("height", height)
  .attr("style", "max-width: 100%; height: auto;");

// Add the scatterplot symbols.
svg
  .append("g")
  .selectAll("rect")
  .data(data)
  .join("rect")
  .attr("width", 2)
  .attr("height", 15)
  .attr("x", (d) => x(d.species) + jitter() - 1)
  .attr("y", (d) => y(d.sepalWidth) - 7.5)
  .attr("fill", (d) => color(d.species))
  .style("opacity", 0.5);

// Append the axes.
svg
  .append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).ticks(width / 80))
  .call((g) => g.select(".domain").remove())
  .call((g) =>
    g
      .append("text")
      .attr("x", width)
      .attr("y", margin.bottom - 4)
      .attr("fill", "currentColor")
      .attr("text-anchor", "end")
      .text("Species")
  );

svg
  .append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(y))
  .call((g) => g.select(".domain").remove())
  .call((g) =>
    g
      .append("text")
      .attr("x", -margin.left)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("↑ Sepal width (cm)")
  );

export const stripplot = svg;
