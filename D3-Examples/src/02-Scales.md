# Scales

In order to control visual properties from data properties we need to be able to calculate transformations from data space to channel space. These transformation functions are **scales** and D3 provides many built in helper functions to assist in thier creation, but you can also always write your own! After all, they are just functions.

Lets consider this little (but delicious!) dataset of fruit.

```js echo
const fruits = [
  { name: "🍊", count: 21 },
  { name: "🍇", count: 13 },
  { name: "🍏", count: 8 },
  { name: "🍌", count: 5 },
  { name: "🍐", count: 3 },
  { name: "🍋", count: 2 },
  { name: "🍎", count: 1 },
  { name: "🍉", count: 1 },
];

display(fruits);
```

Like many visualizations, the bar chart below maps two abstract dimensions to two visual variables: the name dimension is mapped to the bars’ y-position, while the count dimension is mapped to the x-position. These mappings are implemented by the x and y scales that follow.

```js echo
const canvas_width = 500;
const canvas_height = 200;
const margin = 30;

const x_scale = d3
  .scaleLinear()
  .domain([0, d3.max(fruits, (d) => d.count)])
  .range([0, canvas_width])
  .interpolate(d3.interpolateRound);

const y_scale = d3
  .scaleBand()
  .domain(fruits.map((d) => d.name))
  .range([0, canvas_height])
  .padding(0.1)
  .round(true);
```

```js echo
{
  const svg = d3
    .create("svg")
    .attr("width", canvas_width + 2 * margin)
    .attr("height", canvas_height + 2 * margin)
    .style("border", "1px solid white");

  const g = svg.append("g").attr("transform", `translate(${margin},${margin})`);

  const fruit_bars = g
    .selectAll("rect")
    .data(fruits)
    .join("rect")
    .style("fill", "steelblue")
    .attr("x", 0)
    .attr("y", (d) => y_scale(d.name))
    .attr("width", (d) => x_scale(d.count))
    .attr("height", 15);

  const left_axis = g.append("g").call(d3.axisLeft(y_scale));
  const top_axis = g.append("g").call(d3.axisTop(x_scale));

  display(svg.node());
}
```

D3 scales come in many types. Which you use depends on the abstract dimension (quantitative or nominal?) and the visual variable (position or color?). Here x is a linear scale because count is quantitative and bar length should be proportional to value, while y is a band scale because name is nominal and bars are thick. D3 also provides helpers to draw in the visual guides (or axes) corresponding to common scales, these too could be made out of SVG from scratch but often don't need to be.

Each scale is configured by pairwise correspondences from abstract data (the domain) to visual variable (the range). For example, the x-domain’s lower value (0) is mapped to x-range’s lower value (the chart’s left edge), while the domain’s upper value (the maximum count) is mapped to the range’s upper value (the right edge).

For a linear scale, the domain and range are continuous intervals (from min to max). For a band scale, the domain is an array of discrete values (🍊, 🍇, 🍏, …) while the range is a continuous interval; the band scale automatically determines how to slice the range into discrete, padded bands.

The scales above are configured using method chaining. This concise style is possible because methods that configure a scale, such as scale. Furthermore, it is important to rember that ultimatley as D3 scale is _just a function_, and can be called at any time to get the visual value of some abstract value (even if the abstract value is not actually represented in the data, as long as it is in the _domain_ of the scale).

```js echo
display(y_scale("🍇")); // the y-coordinate for name = grapes
```

Position is the strongest visual variable, so it’s not a coincidence that our discussion of scales has so far focused on position.

Yet scales can be used for other visual variables, such as color. 🌈

```js echo
const color = d3
  .scaleOrdinal()
  .domain(fruits.map((d) => d.name))
  .range(d3.schemeTableau10);

display(color("🍇"));
```

Now we can add a redundant encoding to the bar chart, mapping the fruit name to color as well as bar width.

```js echo
{
  const svg = d3
    .create("svg")
    .attr("width", canvas_width + 2 * margin)
    .attr("height", canvas_height + 2 * margin)
    .style("border", "1px solid white");

  const g = svg.append("g").attr("transform", `translate(${margin},${margin})`);

  const fruit_bars = g
    .selectAll("rect")
    .data(fruits)
    .join("rect")
    .style("fill", (d) => color(d.name))
    .attr("x", 0)
    .attr("y", (d) => y_scale(d.name))
    .attr("width", (d) => x_scale(d.count))
    .attr("height", 15);

  const left_axis = g.append("g").call(d3.axisLeft(y_scale));
  const top_axis = g.append("g").call(d3.axisTop(x_scale));

  display(svg.node());
}
```

To explore all of the different built-in D3 scale capabilities visit the [documentation](https://d3js.org/d3-scale)!
