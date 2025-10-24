# Animation

```js echo
await visibility(); // wait until this node is visible
{
  const width = 500;
  const height = 200;
  const r = 50;

  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const circle = svg
    .append("circle")
    .style("fill", "white")
    .attr("r", r)
    .attr("cx", r)
    .attr("cy", height * 0.5)
    .transition()
    .duration(1000)
    .attr("cx", width - r)
    .transition()
    .duration(1000)
    .attr("cx", r);

  display(svg.node());
}
```

```js echo
await visibility(); // wait until this node is visible
{
  const width = 500;
  const height = 200;
  const r = 25;
  const n_circles = 5;

  const data = d3.range(5).map(Object);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .style("overflow", "visible");

  const x = d3.scalePoint().domain(data).range([0, width]).padding(0.5);

  const circle = svg
    .selectAll("circle")
    .data(data)
    .join("circle")
    .style("fill", "white")
    .attr("r", r)
    .attr("cx", (_, i) => x(i))
    .attr("cy", height * 0.5)
    .transition()
    .duration(3000)
    .delay((d) => d * 500)
    .ease(d3.easeElastic)
    .attr("cx", width - r);

  display(svg.node());
}
```

Now lets try animating between two views of the same dataset

```js echo
await visibility(); // wait until this node is visible
{
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
  const x_scale_sepal_length = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.sepalLength))
    .nice()
    .range([margin.left, width - margin.right]);

  const y_scale_sepal_width = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.sepalWidth))
    .nice()
    .range([height - margin.bottom, margin.top]);

  const x_scale_petal_length = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.petalLength))
    .nice()
    .range([margin.left, width - margin.right]);

  const y_scale_petal_width = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.petalWidth))
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
    .attr("cx", (d) => x_scale_sepal_length(d.sepalLength))
    .attr("cy", (d) => y_scale_sepal_width(d.sepalWidth))
    .attr("fill", (d) => color(d.species))
    .transition()
    .duration(5000)
    .attr("cx", (d) => x_scale_petal_length(d.petalLength))
    .attr("cy", (d) => y_scale_petal_width(d.petalWidth));

  // Append the axes.
  scatter_svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x_scale_sepal_length).ticks(width / 80))
    .transition()
    .duration(5000)
    .call(d3.axisBottom(x_scale_petal_length).ticks(width / 80));

  scatter_svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y_scale_sepal_width))
    .transition()
    .duration(5000)
    .call(d3.axisLeft(y_scale_petal_width).ticks(width / 80));

  display(scatter_svg.node());
}
```
