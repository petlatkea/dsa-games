"use strict";
window.addEventListener("load", start);

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 16;

function start() {
  console.log("Building board");

  buildBoard();

  // register key-presses
  document.addEventListener("keydown", keypress);
  document.addEventListener("keyup", keyrelease);

  //  plot(40,40,"snake");
  drawSnake();
  // start loop
  dead = false;
  loop();
  // generate apple
  generateApple();
}

// *** KEYBOARD HANDLING ***
const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
};

function keypress(event) {
  const key = event.key;
  if (key === "ArrowLeft") {
    keys.left = true;
    event.preventDefault();
  }
  if (key === "ArrowRight") {
    keys.right = true;
    event.preventDefault();
  }
  if (key === "ArrowUp") {
    keys.up = true;
    event.preventDefault();
  }
  if (key === "ArrowDown") {
    keys.down = true;
    event.preventDefault();
  }
  if (key === " ") {
    keys.space = true;
    event.preventDefault();
  }

  //console.log(keys);
}

function keyrelease(event) {
  const key = event.key;
  if (key === "ArrowLeft") {
    keys.left = false;
    event.preventDefault();
  }
  if (key === "ArrowRight") {
    keys.right = false;
    event.preventDefault();
  }
  if (key === "ArrowUp") {
    keys.up = false;
    event.preventDefault();
  }
  if (key === "ArrowDown") {
    keys.down = false;
    event.preventDefault();
  }
  if (key === " ") {
    keys.space = false;
    event.preventDefault();
  }

  //console.log(keys);
}

// *** GAMELOOP ***

let dead = false;
let last = 0;

function loop() {
  // calculate delta
  const now = Date.now();
  const delta = (now - (last || now)) / 1000;
  last = now;

  const lastDirection = move.direction;

  // handle change in direction
  if (keys.left && move.direction != direction.right) {
    move.direction = direction.left;
  }
  if (keys.right && move.direction != direction.left) {
    move.direction = direction.right;
  }
  if (keys.up && move.direction != direction.down) {
    move.direction = direction.up;
  }
  if (keys.down && move.direction != direction.up) {
    move.direction = direction.down;
  }

  if (move.direction !== lastDirection) {
    // changed direction - reset offsets
    move.x.offset = move.direction.x;
    move.y.offset = move.direction.y;
  }

  // move in current direction¨
  move.x.offset += delta * speed * move.direction.x;
  move.y.offset += delta * speed * move.direction.y;

  if (-1 >= move.x.offset || move.x.offset >= 1) {
    move.x.offset = 0;
    doMove();
  }

  if (-1 >= move.y.offset || move.y.offset >= 1) {
    move.y.offset = 0;
    doMove();
  }

  function doMove() {
    moveSnake(move.direction.x, move.direction.y);
    drawSnake();
    showQueue();
    showTarget();
  }
  if (!dead) {
    requestAnimationFrame(loop);
  }
}

// *** MOVEMENT ***

let speed = 5;

const direction = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

const move = {
  direction: direction.left,
  x: {
    offset: 0,
  },
  y: {
    offset: 0,
  },
};

// *** INFO ***

function showQueue() {
  const ul = document.querySelector("#queue");
  const html = snake.map(item => `<li>{ ${String(item.x).padStart(2," ")}, ${String(item.y).padStart(2," ")} }</li>\n`).join("");
  
  ul.innerHTML = html;

  document.querySelector("#queuelength").textContent = snake.length;
}

function showTarget() {
  if(apple.visible) {
    document.querySelector("#target").textContent = `{ ${String(apple.x).padStart(2," ")}, ${String(apple.y).padStart(2," ")} }`;
  } else {
    document.querySelector("#target").textContent = `- unknown -`;
  }
}

// *** SNAKE ***

const snake = [
  { x: 10, y: 10 },
  { x: 11, y: 10 },
  { x: 12, y: 10 },
];

function drawSnake() {
  for (const position of snake) {
    plot(position.x, position.y, "snake");
  }
}

function moveSnake(xdir, ydir) {
  // calculate new head
  const head = { x: snake[0].x + xdir, y: snake[0].y + ydir };

  // Fix out of board - could also result in death
  if (head.y >= BOARD_HEIGHT) head.y = 0;
  if (head.y < 0) head.y = BOARD_HEIGHT - 1;
  if (head.x >= BOARD_WIDTH) head.x = 0;
  if (head.x < 0) head.x = BOARD_WIDTH - 1;

  // check if the snake already contains the head (ie, did we hit ourselves)
  if (snake.some(part => part.x == head.x && part.y == head.y)) {
    console.error("DIE");
    dead = true;
  } else {
    // shift new head into beginning of snake
    snake.unshift(head);

    // Check if head meets apple
    if (head.x == apple.x && head.y == apple.y) {
      eatApple();
    } else {
      // if not eating an apple, cut and unplot tail-end
      const tailend = snake.pop();
      unplot(tailend.x, tailend.y, "snake");
    }
  }
}

// *** APPLE ***

const apple = {
  x: 0,
  y: 0,
  visible: false,
};

function generateApple() {
  // create x and y
  apple.x = Math.floor(Math.random() * BOARD_WIDTH);
  apple.y = Math.floor(Math.random() * BOARD_HEIGHT);
  apple.visible = true;
  plot(apple.x, apple.y, "apple");
}

function eatApple() {
  apple.visible = false;
  unplot(apple.x, apple.y, "apple");
  console.log("Eat apple - get point - gain length");

  // generate new apple
  setTimeout(generateApple, Math.random() * 2000);
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
      field.classList.add("field");
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
