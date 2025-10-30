import * as d3 from "npm:d3";
const width = 500;
const height = 100;
const r = 50;

//construct initial state
const animation = d3.create("div");

const drag = d3.drag().on("drag", dragged);

const button = animation
  .append("button")
  .text("Bounce!")
  .style("margin-bottom", "15px")
  .on("click", replay);

const svg = animation
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("overflow", "visible");

const circle = svg
  .append("circle")
  .style("fill", "white")
  .attr("r", r)
  .attr("cx", r)
  .attr("cy", height * 0.5)
  .on("click", toggle_color)
  .call(drag);

// Handle events and updates

let current_color = "red";
let blue_x = r;
let red_x = width - r;

function toggle_color() {
  d3.select(this).interrupt();
  if (current_color == "red") {
    current_color = "blue";
  } else {
    current_color = "red";
  }
  circle.style("fill", current_color);
}

function replay() {
  circle
    .style("fill", "white")
    .transition()
    .duration(2000)
    .ease(d3.easeElastic)
    .attr("cx", red_x)
    .transition()
    .duration(2000)
    .ease(d3.easeElastic)
    .attr("cx", blue_x)
    .on("end", replay);
}

function dragged(event, d) {
  d3.select(this).interrupt();
  circle.attr("cx", event.x).style("fill", current_color);
  if (current_color == "blue") {
    blue_x = event.x;
  } else {
    red_x = event.x;
  }
}

export const solution = animation;
