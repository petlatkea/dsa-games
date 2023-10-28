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
  //  document.addEventListener("keydown", keypress);
  //  document.addEventListener("keyup", keyrelease);

  registerEventsForSettings();

  markStartAndEnd();

  // set visibility from localStorage
  const visibility = localStorage.getItem("visible") == "true";
  setBoardVibility(visibility);
  document.querySelector("form#settings").visible.checked = visibility;

  console.log("Solving Maze");

  // start loop
  completed = false;
  loop();
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

  timer += delta * speed;
  if (timer >= 1) {
    timer = 0;
    makeMove();
  }

  if (!completed) {
    requestAnimationFrame(loop);
  }
}

// *** MOVEMENT ***

let speed = 6;
let timer = 0;

// *** SOLVER ***

const visitedNodes = [];
const path = [];

let mode = "forward";

let lastNode = null;
let currentNode = null;

function makeMove() {
  // if no currentNode - find the first
  if (!currentNode) {
    currentNode = nodes[0];
  }

  if (mode === "forward") {
    visitNode(currentNode);

    // check if we've reached the end
    if (currentNode === nodes[nodes.length - 1]) {
      console.log("The end is found");
      completed = true;
    } else {
      const next = nextNode(currentNode);
      if (next) {
        currentNode = next;
      } else {
        // Backtrack if no next node available.
        mode = "backward";
      }
    }
  } else {
    backtrack();
  }

  showStack();
  showTarget();
}

function backtrack() {
  // unmark last node
  unmarkNode(lastNode, "visiting");
  markNode(lastNode, "dead-end");

  currentNode = path.pop();
  markNode(currentNode, "visiting");

  lastNode = currentNode;

  // if there are unvisited paths from here - go that way
  const next = nextNode(currentNode);
  if (next) {
    mode = "forward";
  }
}

function visitNode(node) {
  if (lastNode) {
    unmarkNode(lastNode, "visiting");
  }
  lastNode = node;
  markNode(node, "visited");
  markNode(node, "visiting");

  visitedNodes.push(node);
  path.push(node);
}

function nextNode(node) {
  // find possible next candidate
  let neighbours = getAccessibleNeighbours(node);

  // eliminate those that have been visited
  neighbours = neighbours.filter(node => !visitedNodes.includes(node));

  // always return the first one (keeps the order s-e-w-n) - or undefined
  // TODO: Maybe add a bit of intelligence if the end is within sight ...
  return neighbours[0];
}

function getAccessibleNeighbours(node) {
  const neighbours = [];
  // if we can move in a direction, that node is a neighbour
  // prefer order s-e-w-n
  if (node.south) {
    neighbours.push(getNode(node.x, node.y + 1));
  }
  if (node.east) {
    neighbours.push(getNode(node.x + 1, node.y));
  }
  if (node.west) {
    neighbours.push(getNode(node.x - 1, node.y));
  }
  if (node.north) {
    neighbours.push(getNode(node.x, node.y - 1));
  }

  return neighbours;
}

// *** SETTINGS ***

function registerEventsForSettings() {
  const form = document.querySelector("form#settings");

  form.visible.addEventListener("click", toggleBoardVisibility);
  form.speed.addEventListener("click", changeSpeed);
  form.restart.addEventListener("click", restartSolution);
  // set initial speed to form
  speed = form.speed.valueAsNumber;
}

function toggleBoardVisibility(event) {
  const visible = event.target.checked;
  setBoardVibility(visible);
}

function setBoardVibility(visible) {
  if (visible) {
    document.querySelector("#board").classList.remove("hide");
  } else {
    document.querySelector("#board").classList.add("hide");
  }
  // store visibility in localStorage
  localStorage.setItem("visible", visible);
}

function changeSpeed(event) {
  speed = event.target.valueAsNumber;
}

function restartSolution(event) {
  event.preventDefault();
  console.log("restart");

  // remove all classes of visitedNodes
  visitedNodes.forEach(node => {
    unmarkNode(node, "visiting");
    unmarkNode(node, "visited");
    unmarkNode(node, "dead-end");
  });

  // clear path and list of visited
  visitedNodes.splice(0, visitedNodes.length);
  path.splice(0, path.length);
  // forget about current and last
  lastNode = null;
  currentNode = null;
  // set mode to forward
  mode = "forward";

  // make sure we are running
  if (completed) {
    completed = false;
    requestAnimationFrame(loop);
  }
}

// *** INFO ***

function showStack() {
  const ul = document.querySelector("#stack");
  const html = path.toReversed().map(node => `<li>{ ${String(node.x).padStart(2," ")}, ${String(node.y).padStart(2," ")} } ${getAccessibleNeighbours(node).length>2?"- fork -":""}</li>\n`).join("");
  ul.innerHTML = html;
  document.querySelector("#stacklength").textContent = path.length;
}

function showTarget() {
  document.querySelector("#target").textContent = `{ ${String(mazeGoal.x).padStart(2, " ")}, ${String(mazeGoal.y).padStart(2, " ")} }${completed?" - reached!":""}`;
  
}

// *** MAZE ***

const nodes = [];
let mazeStart = null;
let mazeGoal = null;

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

function getNode(x, y) {
  return nodes[y * BOARD_WIDTH + x];
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
  createMazeNode(nodes[0]);
}

function createMazeNode(current) {
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
    createMazeNode(neighbour);

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

function markStartAndEnd() {
  mazeStart = nodes[0];
  mazeGoal = nodes[nodes.length-1];
  plot(mazeStart.x, mazeStart.y, "start");
  plot(mazeGoal.x, mazeGoal.y, "end");
}

// *** GRAPHICS ***

function markNode(node, type) {
  plot(node.x, node.y, type);
}

function unmarkNode(node, type) {
  unplot(node.x, node.y, type);
}

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
