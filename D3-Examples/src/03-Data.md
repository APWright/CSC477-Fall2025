# Loading Data

Data visualization does not mean very much without data. Luckily observable framework provides a robust [Data Loading](https://observablehq.com/framework/data-loaders) system for performant data processing in any language. Since we have been using python in the first portion of this class to process data, we will show how to load python data using a data loader.

Look at `"./data/iris.csv.py"` to see how to take a dataframe, and by ouputing to `stdout` with the file name convention, observable framework is able to cache the data on edit, and it is not availble using `FileAttachment`. The following graph uses the techniques we have learned so far to make a simple scatterplot of the iris dataset.

```js
//Load Data
const data = await FileAttachment("./data/iris.csv").csv();

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
const x = d3
  .scaleLinear()
  .domain(d3.extent(data, (d) => d.sepalLength))
  .nice()
  .range([margin.left, width - margin.right]);

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
const scatter_svg = d3
  .create("svg")
  .attr("viewBox", [0, 0, width, height])
  .attr("width", width)
  .attr("height", height)
  .attr("style", "max-width: 100%; height: auto;");

// Add the scatterplot symbols.
scatter_svg
  .append("g")
  .selectAll("circle")
  .data(data)
  .join("circle")
  .attr("r", 5)
  .attr("cx", (d) => x(d.sepalLength))
  .attr("cy", (d) => y(d.sepalWidth))
  .attr("fill", (d) => color(d.species));

// Append the axes.
scatter_svg
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
      .text("Sepal length (cm) →")
  );

scatter_svg
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

// Add a grid.
scatter_svg
  .append("g")
  .attr("stroke", "currentColor")
  .attr("stroke-opacity", 0.1)
  .call((g) =>
    g
      .append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
      .attr("x1", (d) => 0.5 + x(d))
      .attr("x2", (d) => 0.5 + x(d))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
  )
  .call((g) =>
    g
      .append("g")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
      .attr("y1", (d) => 0.5 + y(d))
      .attr("y2", (d) => 0.5 + y(d))
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
  );

display(scatter_svg.node());
```

We can also manage our code a little better to avoid massively long page documents by separating out javasctipt components in separate files and importing them. Note however that we had to explicityly include imports in `stripplot.js` that in order to make the packages that are avilable be default in the observable framework enivornment visible in the component script.

```js
import { stripplot } from "./components/stripplot.js";
display(stripplot.node());
```
