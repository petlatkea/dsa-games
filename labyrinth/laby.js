"use strict";
window.addEventListener("load", start);

const BOARD_WIDTH = 16;
const BOARD_HEIGHT = 16;

function start() {
  console.log("Building Maze");

  buildBoard();
  createNodes();
  createMaze();
  displayNodes();

  // register key-presses
  document.addEventListener("keydown", keypress);
  document.addEventListener("keyup", keyrelease);

  registerEventsForSettings();


  // start loop
  completed = false;
  //  loop();
}

// *** KEYBOARD HANDLING ***


// *** GAMELOOP ***

let completed = false;
let last = 0;

function loop() {
  // calculate delta
  const now = Date.now();
  const delta = (now - (last || now)) / 1000;
  last = now;

  const lastDirection = move.direction;

 
  if (!completed) {
    requestAnimationFrame(loop);
  }
}

// *** MOVEMENT ***



// *** SETTINGS ***



// *** INFO ***



// *** MAZE ***

const nodes = [];

function createNodes() {
  nodes.splice(0, nodes.length);
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const node = {
        x: x,
        y: y,
        north: false,
        east: false,
        south: false,
        west: false,
      };
      nodes.push(node);
    }
  }
}

function getNeighbours(node) {
  let neighbours = [];
  // find neighbours (border-cells have fewer than others)
  if (node.x > 0) neighbours.push(nodes[node.y * BOARD_WIDTH + node.x - 1]);
  if (node.x < BOARD_WIDTH - 1) neighbours.push(nodes[node.y * BOARD_WIDTH + node.x + 1]);
  if (node.y > 0) neighbours.push(nodes[(node.y - 1) * BOARD_WIDTH + node.x]);
  if (node.y < BOARD_HEIGHT - 1) neighbours.push(nodes[(node.y + 1) * BOARD_WIDTH + node.x]);

  return neighbours;
}

function createMaze() {
  let current = nodes[0];

  visitNode(current);
}

function visitNode(current) {
  current.visited = true;

  let x = current.x;
  let y = current.y;

  // find unvisited neighbours
  let neighbours = getNeighbours(current).filter(node => !node.visited);
  while (neighbours.length > 0) {
    // select a random one
    const neighbour = neighbours[Math.floor(Math.random() * neighbours.length)];

    // connect neighbour and current
    if (neighbour.x > current.x) {
      // it is to the east
      current.east = true;
      neighbour.west = true;
    } else if (neighbour.x < current.x) {
      // it is to the west
      current.west = true;
      neighbour.east = true;
    } else if (neighbour.y < current.y) {
      // it is to the north
      current.north = true;
      neighbour.south = true;
    } else if (neighbour.y > current.y) {
      // it is to the south
      current.south = true;
      neighbour.north = true;
    }
    // visit that neighbour, and so on and on ...
    visitNode(neighbour);

    // find any remaining unvisited neighbours, and loop
    neighbours = neighbours.filter(node => !node.visited);
  }
}

function displayNodes() {
  const visualnodes = document.querySelectorAll("#board .node");
  for (let i = 0; i < visualnodes.length; i++) {
    const v_node = visualnodes[i];
    const m_node = nodes[i];

    const dirs = ["north", "east", "south", "west"];
    for (const dir of dirs) {
      if (m_node[dir]) {
        v_node.classList.add(dir);
      } else {
        v_node.classList.remove(dir);
      }
    }
  }
}

// *** GRAPHICS ***

function plot(x, y, type) {
  const board = document.querySelector("#board");
  const field = board.children.item(y * BOARD_WIDTH + x);
  field.classList.add(type);
}

function unplot(x, y, type) {
  const board = document.querySelector("#board");
  const field = board.children.item(y * BOARD_WIDTH + x);
  field.classList.remove(type);
}

function buildBoard() {
  const board = document.querySelector("#board");
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const field = document.createElement("div");
      field.classList.add("node");
      board.appendChild(field);
      if (x == BOARD_WIDTH - 1) {
        field.classList.add("lastx");
      }
      if (y == BOARD_HEIGHT - 1) {
        field.classList.add("lasty");
      }
    }
  }
  board.style.setProperty("--WIDTH", BOARD_WIDTH);
  board.style.setProperty("--HEIGHT", BOARD_HEIGHT);
}
