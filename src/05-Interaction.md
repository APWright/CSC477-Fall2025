# Interaction

Interaction is the key capability that separates the dynamic medium of computational visualization from more traditional static forms. Interactive controls enable user choices and behaviour to determine different aspects of our visual encoding, forming another mode of data to drive our documents. In order for this to work first we have to gain access to user inputs.

## HTML Inputs

On the web the most basic style of user input (and sometimes the most flexible) is using HTML inputs. In observable framework we can access the values of arbitrary HTML as reactive variables.

```js echo
const n = view(html`<input type="range" step="1" min="1" max="15" />`);
```

```js echo
display(n);
```

## Observable inputs

Instead of wiring up a bunch of HTML, when using observable framework the easiest way to get user inputs is using the `Inputs` library. Inputs are typically passed to the `view` function for display, while exposing the input’s value generator as a reactive variable. Options differ between inputs. For example, the checkbox input accepts options to disable all or certain values, sort displayed values, and only display repeated values _once_ (among others):

```js echo echo
const checkout = view(
  Inputs.checkbox(["B", "A", "Z", "Z", "⚠️F", "D", "G", "G", "G", "⚠️Q"], {
    disabled: ["⚠️F", "⚠️Q"],
    sort: true,
    unique: true,
    value: "B",
    label: "Choose categories:",
  })
);
```

```js echo echo
display(checkout);
```

Additonally, framework provides a few pre-bound reactive variables representing the state of the overall window such as the width of the view and the current time. These can also be used in the same way as other inputs to build reactive visualizations or layouts.

```js echo
display(`Window width: ${width}`); // Try resizing your window and see the value change
display(`Current time (epoch): ${now}`);
```

## Using inputs in visualization

Once we have access to user inputs, the next step is to have our visualizations change in response to input. This can be done by running code in respnse to input changes.

```js echo
const replay = view(Inputs.button("Replay Animation"));
```

```js echo
replay; // run this block when the button is clicked
{
  const height = 100;
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

Additionally this can be done by introducing a reactive variable into your chart defininition. Reactive variables can be a bit tricky and I recommend you read up on how they work [in the docs.](https://observablehq.com/framework/reactivity)

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
const threshold = view(
  Inputs.range(
    [d3.min(fruits, (d) => d.count) - 1, d3.max(fruits, (d) => d.count) + 1],
    { label: "Threshold", step: 1 }
  )
);
```

```js echo
{
  const height = 250;
  const margin = 30;
  const x_scale = d3
    .scaleLinear()
    .domain([0, d3.max(fruits, (d) => d.count)])
    .range([0, width - 2 * margin])
    .interpolate(d3.interpolateRound);

  const y_scale = d3
    .scaleBand()
    .domain(fruits.map((d) => d.name))
    .range([0, height - 2 * margin])
    .padding(0.1)
    .round(true);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "1px solid white");

  const g = svg.append("g").attr("transform", `translate(${margin},${margin})`);
  const left_axis = g.append("g").call(d3.axisLeft(y_scale));
  const top_axis = g.append("g").call(d3.axisTop(x_scale));

  const color = (d) => (d.count <= threshold ? "steelblue" : "red");

  const fruit_bars = g
    .selectAll("rect")
    .data(fruits)
    .join("rect")
    .style("fill", (d) => color(d))
    .attr("x", 0)
    .attr("y", (d) => y_scale(d.name))
    .attr("width", (d) => x_scale(d.count))
    .attr("height", 15);

  display(svg.node());
}
```

Lets make the animated view change from before into an interactive animation! To avoid redrawing the whole thing from scratch with every update of the interaction paramters, we will construct our initial state in one cell that is not dependent on the reactive variable, and separately construct an update cell which responds to user input.

```js
const iris_data = FileAttachment("./data/iris.csv").csv();

const x_axis_selector = view(
  Inputs.select(["sepalLength", "sepalWidth", "petalLength", "petalWidth"], {
    sort: true,
    value: "sepalLength",
    label: "X Axis",
  })
);

const y_axis_selector = view(
  Inputs.select(["sepalLength", "sepalWidth", "petalLength", "petalWidth"], {
    sort: true,
    value: "sepalWidth",
    label: "Y Axis",
  })
);
```

```js
const height = 600;
const margin = {
  top: 25,
  bottom: 35,
  right: 20,
  left: 40,
};

// Create the color scale.
const color = d3.scaleOrdinal(
  d3.group(iris_data, (d) => d.species).keys(),
  d3.schemeCategory10
);
const x_scale = d3
  .scaleLinear()
  .domain(d3.extent(iris_data, (d) => d.sepalLength))
  .nice()
  .range([margin.left, width - margin.right]);

const y_scale = d3
  .scaleLinear()
  .domain(d3.extent(iris_data, (d) => d.sepalWidth))
  .nice()
  .range([height - margin.bottom, margin.top]);

// Create the SVG container.
const scatter_svg = d3
  .create("svg")
  .attr("viewBox", [0, 0, width, height])
  .attr("width", width)
  .attr("height", height)
  .attr("style", "max-width: 100%; height: auto;");

// Append the axes.
const x_axis = scatter_svg
  .append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x_scale).ticks(width / 80));

const y_axis = scatter_svg
  .append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(y_scale));

// Add the scatterplot symbols.
const scatter_points = scatter_svg
  .append("g")
  .selectAll("circle")
  .data(iris_data, (d) => d)
  .join("circle")
  .attr("r", 5)
  .attr("fill", (d) => color(d.species))
  .attr("cx", (d) => x_scale(d.sepalLength))
  .attr("cy", (d) => y_scale(d.sepalWidth));

display(scatter_svg.node());
```

```js echo
const x_scale = d3
  .scaleLinear()
  .domain(d3.extent(iris_data, (d) => d[x_axis_selector]))
  .nice()
  .range([margin.left, width - margin.right]);

const y_scale = d3
  .scaleLinear()
  .domain(d3.extent(iris_data, (d) => d[y_axis_selector]))
  .nice()
  .range([height - margin.bottom, margin.top]);

// x_axis
//   .transition()
//   .duration(3000)
//   .call(d3.axisBottom(x_scale).ticks(width / 80));

// y_axis.transition().duration(3000).call(d3.axisLeft(y_scale));

scatter_points
  .transition()
  .duration(3000)
  .attr("cx", (d) => x_scale(d[x_axis_selector]))
  .attr("cy", (d) => y_scale(d[y_axis_selector]));
```

## Managing inputs in d3

An alternative to using the observable framework features which can help orchestrate general code execution between code blocks, we can also manage inputs entirely within D3. D3 stands for Data Driven Documents after all, and so the kinds of elements that can be managed are not limted to SVG but can include HTML as well.

```js echo
{
  const height = 100;
  const r = 50;

  //construct initial state
  const animation = d3.create("div");

  const button = animation
    .append("button")
    .text("Replay!")
    .style("margin-bottom", "15px")
    .on("click", replay);

  const svg = animation
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const circle = svg
    .append("circle")
    .style("fill", "white")
    .attr("r", r)
    .attr("cx", r)
    .attr("cy", height * 0.5);

  // Handle events and updates

  function replay() {
    circle
      .transition()
      .duration(1000)
      .attr("cx", width - r)
      .transition()
      .duration(1000)
      .attr("cx", r);
  }

  display(animation.node());
}
```

## Making the visualization the input

Interaction is also not limited to HTML controls but can be made more powerful by directly interacting with data-bound elements. When using this method make sure you are familiar with d3 [Event Listening.](https://d3js.org/d3-selection/events)

```js echo
{
  //Load Data
  const data = await FileAttachment("./data/iris.csv").csv();

  // Specify the chart’s dimensions.
  const height = 600;
  const margin = {
    top: 25,
    bottom: 35,
    right: 20,
    left: 40,
  };

  let x_axis_variable = "sepalLength";
  let y_axis_variable = "sepalWidth";

  const chart = d3.create("div");

  const x_selector = chart
    .append("select")
    .on("change", update_x_axis)
    .style("margin-bottom", "15px");
  x_selector
    .selectAll("option")
    .data(["sepalLength", "sepalWidth", "petalLength", "petalWidth"])
    .join("option")
    .text((d) => d)
    .attr("value", (d) => d)
    .attr("selected", (d) => {
      if (d == x_axis_variable) {
        return "selected";
      }
    });

  const y_selector = chart
    .append("select")
    .attr("value", y_axis_variable)
    .on("change", update_y_axis)
    .style("margin-bottom", "15px")
    .style("margin-left", "15px");
  y_selector
    .selectAll("option")
    .data(["sepalLength", "sepalWidth", "petalLength", "petalWidth"])
    .join("option")
    .text((d) => d)
    .attr("value", (d) => d)
    .attr("selected", (d) => {
      if (d == y_axis_variable) {
        return "selected";
      }
    });

  // Create the positional scales.
  const x_scale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[x_axis_variable]))
    .nice()
    .range([margin.left, width - margin.right]);

  const y_scale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[y_axis_variable]))
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Create the color scale.
  const color = d3.scaleOrdinal(
    d3.group(data, (d) => d.species).keys(),
    d3.schemeCategory10
  );

  // Create the SVG container.
  const svg = chart
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

  const background = svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#00000000")
    .on("click", (event) => {
      svg
        .selectAll("circle")
        .transition()
        .duration(100)
        .attr("fill", (d) => color(d.species));
    });
  // Add the scatterplot symbols.
  const scatter_points = svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", 5)
    .attr("cx", (d) => x_scale(d[x_axis_variable]))
    .attr("cy", (d) => y_scale(d[y_axis_variable]))
    .attr("fill", (d) => color(d.species))
    .attr("class", (d) => d.species);

  function remove_highlight_handlers() {
    background.on("click", null);
    scatter_points.on("mouseover", null).on("mouseout", null).on("click", null);
  }
  function add_highlight_handlers() {
    background.on("click", (event) => {
      svg
        .selectAll("circle")
        .transition()
        .duration(100)
        .attr("fill", (d) => color(d.species));
    });
    scatter_points
      .on("mouseover", function (e, d) {
        d3.select(this).transition().duration(100).attr("r", 15);
      })
      .on("mouseout", function (e, d) {
        d3.select(this).transition().duration(100).attr("r", 5);
      })
      .on("click", function (e, d) {
        svg
          .selectAll("circle")
          .transition()
          .duration(100)
          .attr("fill", "#CCCCCC22");

        svg
          .selectAll(`.${d.species}`)
          .transition()
          .duration(100)
          .attr("fill", (d) => color(d.species));
      });
  }
  add_highlight_handlers();
  // remove_highlight_handlers();

  // Append the axes.
  const x_axis = svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x_scale).ticks(width / 80))
    .call((g) =>
      g
        .append("text")
        .attr("class", "x_axis_label")
        .attr("x", width)
        .attr("y", margin.bottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(`${x_axis_variable} (cm) →`)
    );

  const y_axis = svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y_scale))
    .call((g) =>
      g
        .append("text")
        .attr("class", "y_axis_label")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(`↑ ${y_axis_variable} (cm) →`)
    );

  function update_x_axis(event) {
    // remove_highlight_handlers();

    const new_axis = event.srcElement.value;
    const x_scale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[new_axis]))
      .nice()
      .range([margin.left, width - margin.right]);

    x_axis
      .transition()
      .duration(3000)
      .call(d3.axisBottom(x_scale).ticks(width / 80))
      .call((g) => g.select(".x_axis_label").text(`↑ ${new_axis} (cm)`));
    //

    scatter_points
      .transition()
      .duration(3000)
      .attr("cx", (d) => x_scale(d[new_axis]))
      .on("end", add_highlight_handlers);
  }

  function update_y_axis(event) {
    remove_highlight_handlers();

    const new_axis = event.srcElement.value;
    const y_scale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[new_axis]))
      .nice()
      .range([height - margin.bottom, margin.top]);

    y_axis
      .transition()
      .duration(5000)
      .call(d3.axisLeft(y_scale))
      .call((g) => g.select(".y_axis_label").text(`${new_axis} (cm)`));

    scatter_points
      .transition()
      .duration(5000)
      .attr("cy", (d) => y_scale(d[new_axis]))
      .on("end", add_highlight_handlers);
  }

  display(chart.node());
}
```

## Brushing

While general kinds of interaction are extremeley powerful and will be essential to creating compelling bespoke visualizations. There are many kinds of interaction styles that will be common across many different designs and so D3 has additional features to make these interactions easy to include.

Brushing is the interactive specification a one- or two-dimensional selected region using a pointing gesture, such as by clicking and dragging the mouse. Brushing is often used to select discrete elements, such as dots in a scatterplot or files on a desktop. It can also be used to zoom-in to a region of interest, or to select continuous regions for cross-filtering data or live histograms.

<iframe width="100%" height="1826" frameborder="0"
  src="https://observablehq.com/embed/@d3/mona-lisa-histogram?cells=chart"></iframe>

The [d3-brush module](https://d3js.org/d3-brush) implements brushing for mouse and touch events using SVG. Click and drag on the brush selection to translate the selection.

```js echo
{
  //Load Data
  const data = await FileAttachment("./data/iris.csv").csv();

  // Specify the chart’s dimensions.
  const height = 600;
  const margin = {
    top: 25,
    bottom: 35,
    right: 20,
    left: 40,
  };

  let x_axis_variable = "sepalLength";
  let y_axis_variable = "sepalWidth";

  const chart = d3.create("div");

  // Create the positional scales.
  const x_scale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[x_axis_variable]))
    .nice()
    .range([margin.left, width - margin.right]);

  const y_scale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[y_axis_variable]))
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Create the color scale.
  const color = d3.scaleOrdinal(
    d3.group(data, (d) => d.species).keys(),
    d3.schemeCategory10
  );

  // Create the SVG container.
  const svg = chart
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

  // Add the scatterplot symbols.
  const scatter_points = svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", 5)
    .attr("cx", (d) => x_scale(d[x_axis_variable]))
    .attr("cy", (d) => y_scale(d[y_axis_variable]))
    .attr("fill", (d) => color(d.species))
    .attr("class", (d) => d.species);

  // Append the axes.
  const x_axis = svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x_scale).ticks(width / 80))
    .call((g) =>
      g
        .append("text")
        .attr("class", "x_axis_label")
        .attr("x", width)
        .attr("y", margin.bottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(`${x_axis_variable} (cm) →`)
    );

  const y_axis = svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y_scale))
    .call((g) =>
      g
        .append("text")
        .attr("class", "y_axis_label")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(`↑ ${y_axis_variable} (cm) →`)
    );

  // Add brushing
  svg.call(
    d3
      .brush() // Add the brush feature using the d3.brush function
      .on("start brush end", ({ selection }) => {
        console.log(selection);
        if (selection) {
          const [[x0, y0], [x1, y1]] = selection;

          scatter_points.attr("fill", (d) => {
            const isBrushed =
              x0 <= x_scale(d[x_axis_variable]) &&
              x1 >= x_scale(d[x_axis_variable]) &&
              y0 <= y_scale(d[y_axis_variable]) &&
              y1 >= y_scale(d[y_axis_variable]);

            return isBrushed ? color(d.species) : "#CCCCCC22";
          });
        } else {
          scatter_points.attr("fill", (d) => color(d.species));
        }
      })
  );

  display(chart.node());
}
```

## Panning and Zooming

Another very common mode of interaction is panning and zooming which can be more easily implmented using [d3-Zoom](https://d3js.org/d3-zoom). These interactions let the user focus on a region of interest by restricting the view. It uses direct manipulation: click-and-drag to pan (translate), spin the wheel to zoom (scale), or pinch with touch. Panning and zooming are widely used in web-based mapping, but can also be used in visualization such as dense time series and scatterplots.

```js echo
{
  //Load Data
  const data = await FileAttachment("./data/iris.csv").csv();

  // Specify the chart’s dimensions.
  const height = 600;
  const margin = {
    top: 25,
    bottom: 35,
    right: 20,
    left: 40,
  };

  let x_axis_variable = "sepalLength";
  let y_axis_variable = "sepalWidth";

  const chart = d3.create("div");

  // Create the positional scales.
  const x_scale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[x_axis_variable]))
    .nice()
    .range([margin.left, width - margin.right]);

  const y_scale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[y_axis_variable]))
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Create the color scale.
  const color = d3.scaleOrdinal(
    d3.group(data, (d) => d.species).keys(),
    d3.schemeCategory10
  );

  // Create the SVG container.
  const svg = chart
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

  // Add a clipPath: everything out of this area won't be drawn.
  var clip = svg
    .append("defs")
    .append("SVG:clipPath")
    .attr("id", "clip")
    .append("SVG:rect")
    .attr("width", width - margin.right - margin.left)
    .attr("height", height - margin.bottom - margin.top)
    .attr("x", margin.left)
    .attr("y", margin.top);

  // Add the scatterplot symbols.
  const scatter_points = svg
    .append("g")
    .attr("clip-path", "url(#clip)")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", 5)
    .attr("cx", (d) => x_scale(d[x_axis_variable]))
    .attr("cy", (d) => y_scale(d[y_axis_variable]))
    .attr("fill", (d) => color(d.species))
    .attr("class", (d) => d.species);

  // Append the axes.
  const x_axis = svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x_scale).ticks(width / 80))
    .call((g) =>
      g
        .append("text")
        .attr("class", "x_axis_label")
        .attr("x", width)
        .attr("y", margin.bottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(`${x_axis_variable} (cm) →`)
    );

  const y_axis = svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y_scale))
    .call((g) =>
      g
        .append("text")
        .attr("class", "y_axis_label")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(`↑ ${y_axis_variable} (cm) →`)
    );

  const zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", zoomed);

  svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

  function zoomed({ transform }) {
    const zoomed_x_scale = transform
      .rescaleX(x_scale)
      .interpolate(d3.interpolateRound);

    const zoomed_y_scale = transform
      .rescaleY(y_scale)
      .interpolate(d3.interpolateRound);

    scatter_points.attr("transform", transform);

    x_axis.call(d3.axisBottom(zoomed_x_scale).ticks(width / 80));
    y_axis.call(d3.axisLeft(zoomed_y_scale));
  }

  display(chart.node());
}
```

In addition to freeform zooming, d3-Zoom provides capabilities for more "on the rails" zooming for strucutred nagivation or storytelling

<iframe width="100%" height="584" frameborder="0"
  src="https://observablehq.com/embed/@d3/smooth-zooming?cells=chart"></iframe>

## Dragging

[Dragging](https://d3js.org/d3-drag) is a very cool interaction techniques when dealing with spatial elements, in particular graphs or cases where you may want to have user definable groupings and heirarchies. Additionally dragging is the interaction to use if you want to have custom shaped lasso selection, or user drawn line inputs.

This example uses multiple interactions including draging as well as a [force simulation](https://d3js.org/d3-force).

```js echo
{
  const graph = {
    nodes: Array.from({ length: 13 }, () => ({})),
    links: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 0 },
      { source: 1, target: 3 },
      { source: 3, target: 2 },
      { source: 3, target: 4 },
      { source: 4, target: 5 },
      { source: 5, target: 6 },
      { source: 5, target: 7 },
      { source: 6, target: 7 },
      { source: 6, target: 8 },
      { source: 7, target: 8 },
      { source: 9, target: 4 },
      { source: 9, target: 11 },
      { source: 9, target: 10 },
      { source: 10, target: 11 },
      { source: 11, target: 12 },
      { source: 12, target: 10 },
    ],
  };
  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]),
    link = svg
      .selectAll(".link")
      .data(graph.links)
      .join("line")
      .classed("link", true),
    node = svg
      .selectAll(".node")
      .data(graph.nodes)
      .join("circle")
      .attr("r", 12)
      .classed("node", true)
      .classed("fixed", (d) => d.fx !== undefined);

  const simulation = d3
    .forceSimulation()
    .nodes(graph.nodes)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("link", d3.forceLink(graph.links))
    .on("tick", tick);

  const drag = d3.drag().on("start", dragstart).on("drag", dragged);

  node.call(drag).on("click", click);

  function tick() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  }

  function click(event, d) {
    delete d.fx;
    delete d.fy;
    d3.select(this).classed("fixed", false);
    simulation.alpha(1).restart();
  }

  function dragstart() {
    d3.select(this).classed("fixed", true);
  }

  function dragged(event, d) {
    d.fx = clamp(event.x, 0, width);
    d.fy = clamp(event.y, 0, height);
    simulation.alpha(1).restart();
  }

  function clamp(x, lo, hi) {
    return x < lo ? lo : x > hi ? hi : x;
  }

  display(svg.node());
}
```

```html
<style>
.link {
  stroke: #d0d0d0ff;
  stroke-width: 2px;
}

.node {
  cursor: move;
  fill: #eaeaeaff;
  stroke: #000;
  stroke-width: 1.5px;
}

.node.fixed {
  fill: rgba(200, 30, 30, 1);
}
<style>
```

## Excercise

Below is an the code for the replayable animated ball from above. How would you change it to allow the user to drag the ball around, and when clicked go between red and blue states. When pressing replay the ball will animate to go back and forth between the two positions defined by the last position in the red and blue states, until you try to drag it agaian. What about adding a widget to determine the speed of the bouncing? Included is a solution to the problem if you need help or to compare to your solution.

```js
import { solution } from "./components/interaction_excercise.js";

{
  // Template for your solution

  // Construct initial state
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
    .transition() //These transitions should only be applied in the interaction handlers
    .duration(1000)
    .attr("cx", width - r)
    .transition()
    .duration(1000)
    .attr("cx", r);

  //TODO add in components for dragging in the initial state

  // Handle events and updates

  //TODO add in event handlers and animated transtions to state properties

  //Change this to your solution and see how it works!
  display(solution.node());
}
```
