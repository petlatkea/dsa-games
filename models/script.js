"use strict";
window.addEventListener("load", start);

function start() {
  console.log("Creating objects");



  // register key-presses
  document.addEventListener("keydown", keypress);
  document.addEventListener("keyup", keyrelease);

  registerEventsForSettings();

  //  plot(40,40,"snake");
//  drawSnake();
  // start loop
  dead = false;
  loop();
  // generate apple
//  generateApple();
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

  // handle movement
  if(keys.down) {
    spaceship.y+=speed*delta;
  } else if(keys.up) {
    spaceship.y-=speed*delta;
  }
  if(keys.left) {
    spaceship.x-=speed*delta;
  } else if(keys.right) {
    spaceship.x+=speed*delta;
  }

  // clamp movement
  spaceship.x = clamp(spaceship.x,0,60);  
  spaceship.y = clamp(spaceship.y,0,34);
  
  moveEnemies(delta);

  // update display
  displaySpaceShip();
  displayEnemies();

  // update info
  showSpaceShipInfo();
  showEnemiesInfo();



  if (!dead) {
    requestAnimationFrame(loop);
  }
}

// *** HELPERS ***

function clamp(value,min,max) {
  if(value < min) {
    return min;
  }
  if(value > max) {
    return max;
  }
  return value;
}

// *** MOVEMENT ***

let speed = 20;
let enemySpeed = 10;

function moveEnemies(delta) {
  for(const enemy of enemies) {
    enemy.x-=enemySpeed*delta;
    if(enemy.x < 10) {
      // TODO: If enemy smaller than outside, restart enemy, loose point, etc

    }
  }
}

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

// *** SETTINGS ***

function registerEventsForSettings() {
  const form = document.querySelector("form#settings");

  form.visible.addEventListener("click", toggleBoardVisibility);
  form.speed.addEventListener("click", changeSpeed);

}

function toggleBoardVisibility(event) {
  const visible = event.target.checked;
  if(visible) {
    document.querySelector("#board").classList.remove("hide");
  } else {
    document.querySelector("#board").classList.add("hide");
  }
}

function changeSpeed(event) {
  const _speed = event.target.valueAsNumber;
  speed = _speed;
}


// *** INFO ***

function showEnemiesInfo() {
  const ul = document.querySelector("#enemies_info");
  const html = enemies.map(item => `<li>{ ${String(Math.floor(item.x)).padStart(2," ")}, ${String(Math.floor(item.y)).padStart(2," ")} }</li>\n`).join("");
  
  ul.innerHTML = html;

  document.querySelector("#enemies_length").textContent = enemies.length;
}

function showSpaceShipInfo() {
  document.querySelector("#spaceship_info").textContent = `{ ${String(Math.floor(spaceship.x)).padStart(2," ")}, ${String(Math.floor(spaceship.y)).padStart(2," ")} }`;
  
}

// *** MODELS ***

const spaceship = {
  x: 0,
  y: 0,
  energy: 100,
  firing: false
}

const enemies = [
  {
    x: 60,
    y: 10,
    health: 100
  },
  {
    x: 70,
    y: 20,
    health: 100
  }
]



// *** GRAPHICS ***

function displaySpaceShip() {
  const element = document.querySelector("#spaceship");
  element.style.transform = `translate( ${spaceship.x}vw, ${spaceship.y}vw)`;
}

function displayEnemies() {
  const elements = document.querySelectorAll(".enemy");
  for(let i=0; i < enemies.length; i++) {
    elements[i].style.transform = `translate( ${enemies[i].x}vw, ${enemies[i].y}vw)`;
  }
}