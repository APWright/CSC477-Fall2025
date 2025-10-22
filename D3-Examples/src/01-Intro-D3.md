# Introduction to D3

In observable framework we can write documents using standard markdown format. And embed live javascript and d3 code using fenced code blocks.

```js
const x = 2 + 2;
display(x);
```

Lets start with just setting up a basic SVG canvas.

```js
{
  const w = 100;
  const h = 100;

  const svg = d3
    .create("svg")
    .attr("width", w)
    .attr("height", h)
    .style("border", "1px solid white");

  display(svg.node());
}
```

Now lets add some shapes. Note how shapes can be drawn on top of eachother, order matters just like painting on a physical canvas. Careful to stay inside the lines!

```js
{
  const w = 100;
  const h = 100;

  const svg = d3
    .create("svg")
    .attr("width", w)
    .attr("height", h)
    .style("border", "1px solid white");

  //SVG, like the rest of the DOM, has a heirarchacal structure. Elements are emebeded within parent groups and containers. D3 makes this easy to manage.
  svg
    .append("rect")
    .style("fill", "steelblue")
    .attr("x", 25)
    .attr("y", 25)
    .attr("width", 15)
    .attr("height", 60);

  svg
    .append("circle")
    .style("fill", "red")
    .attr("cx", 40)
    .attr("cy", 45)
    .attr("r", 10);

  svg
    .append("circle")
    .style("fill", "orange")
    .attr("cx", 95)
    .attr("cy", 5)
    .attr("r", 30);

  display(svg.node());
}
```

Now lets add some data.

```js
{
  const w = 100;
  const h = 100;

  const svg = d3
    .create("svg")
    .attr("width", w)
    .attr("height", h)
    .style("border", "1px solid white");

  const bar_data = [1, 1.2, 1.7, 1.5, 0.7];

  const bar_chart = svg
    .selectAll("rect") // Select elements that do not yet exist!
    .data(bar_data) // Bind elements to data
    .join("rect") // Join takes care of applying the encoding functions to the right objects (and creating/removing them!) based on our specified selection and data binding.
    .style("fill", "steelblue")
    .attr("x", (_, i) => i * 20)
    .attr("y", (d) => h - d * 50)
    .attr("width", 15)
    .attr("height", (d) => d * 50);

  display(svg.node());
}
```

Now try changing this code to make the chart horizontal.

```js
{
  const w = 100;
  const h = 100;

  const svg = d3
    .create("svg")
    .attr("width", w)
    .attr("height", h)
    .style("border", "1px solid white");

  const bar_data = [1, 1.2, 1.7, 1.5, 0.7];

  const horizontal_bar_chart = svg
    .selectAll("rect")
    .data(bar_data)
    .join("rect");
  // Your code here

  display(svg.node());
}
```
