"use strict";
window.addEventListener("load", start);

function start() {
  console.log("Creating objects");
  createEnemy();
  createEnemy();
  createEnemy();
  spaceship.element = document.querySelector("#spaceship");

  // register key-presses
  document.addEventListener("keydown", keypress);
  document.addEventListener("keyup", keyrelease);

  registerEventsForSettings();

  // start loop
  dead = false;
  loop();
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

let throttle = 10;
let dead = false;
let last = 0;

function loop() {
  // calculate delta
  const now = Date.now();
  const delta = (now - (last || now)) / 1000 * throttle / 10;
  last = now;

  // handle movement of spaceship
  if(keys.down) {
    spaceship.y+=spaceship.speed*delta;
  } else if(keys.up) {
    spaceship.y-=spaceship.speed*delta;
  }
  if(keys.left) {
    spaceship.x-=spaceship.speed*delta;
  } else if(keys.right) {
    spaceship.x+=spaceship.speed*delta;
  }

  // clamp movement
  spaceship.x = clamp(spaceship.x,0,60);  
  spaceship.y = clamp(spaceship.y,0,34);
  
  moveEnemies(delta);
  moveShots(delta);

  // handle shooting
  if(keys.space && !spaceship.firing) {
    spaceship.firing = true;
    createShot(spaceship);
  }
  // wait for fire-button to be released before allowing to fire again
  if(spaceship.firing && !keys.space) {
    spaceship.firing = false;
  }

  // handle collissions
  for(const shot of shots) {
    // check if each shot collides with an enemy somehow
    for(const enemy of enemies) {
      if(testCollision(shot,enemy)) {
        // damage enemy
        damageEnemy(enemy, shot);
        // remove shot
        removeShot(shot);
      }
    }
  }


  // update display
  displaySpaceShip();
  displayEnemies();
  displayShots();

  // update info
  showSpaceShipInfo();
  showEnemiesInfo();
  showShotsInfo();


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

function testCollision(shot,enemy) {
  if(shot.x >= enemy.x-2 && shot.x <= enemy.x+7 
  &&  shot.y >= enemy.y && shot.y <= enemy.y+3 ) {
    return true;
  }
}

// *** ENEMIES ***

const MAX_ENEMIES = 10;

function createEnemy() {
  const enemy = {
    x: 80,
    y: Math.random()*34,
    speed: 8 + Math.random()*4,
    health: 100
  }
  
  enemy.element = document.createElement("div");
  enemy.element.classList.add("enemy");
  document.querySelector("#enemies").appendChild(enemy.element);

  enemies.push(enemy);
}

function restartEnemy(enemy) {
  enemy.x = 80;
  enemy.y = Math.random()*34 + 4; // enemies at the very top, cannot be hit by shots
  enemy.speed = 8 + Math.random()*4;
}

function moveEnemies(delta) {
  for(const enemy of enemies) {
    enemy.x-=enemy.speed*delta;
    if(enemy.x < -10) {
      // If enemy gets past border, restart it, and maybe spawn another
      // TODO:  loose point, etc
      restartEnemy(enemy);
      // spawn another enemy - if we are below max, and we roll the dice 1/3
      if(enemies.length < MAX_ENEMIES && Math.random() < .3) {
        createEnemy();
      }
    }
  }
}

function damageEnemy(enemy,shot) {
  enemy.health-=shot.damage;
  // If health < 0, die
  if(enemy.health <= 0) {
    killEnemy(enemy);
  }
}

function killEnemy(enemy) {
  // remove enemy from list immediately
  enemies.splice(enemies.indexOf(enemy), 1);
  // then add explode-animation
  enemy.element.classList.add("explode");
  enemy.element.style.transformOrigin = `${enemy.x+4}vw ${enemy.y+1}vw`;
  enemy.element.addEventListener("animationend", () => {
    // finally remove element from DOM
    enemy.element.remove();
  });
}

// *** SHOTS ***

function createShot(spaceship) {
  const shot = {
    x: spaceship.x+10,
    y: spaceship.y+4,
    speed: 40,
    damage: 20,
    element: document.createElement("div")
  }

  shot.element.classList.add("shot");
  document.querySelector("#shots").appendChild(shot.element);
  
  shots.push(shot);
}

function removeShot(shot) {
  // remove from array
  shots.splice(shots.indexOf(shot),1);
  // remove from document
  shot.element.remove();
}

function moveShots(delta) {
  for(const shot of shots) {
    shot.x+=shot.speed*delta;
    if(shot.x > 74) {
      removeShot(shot);
    }
  }
}

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
  throttle = _speed;
}


// *** INFO ***

function showEnemiesInfo() {
  const ul = document.querySelector("#enemies_info");
  const html = enemies.map(item => `<li>{ ${String(Math.floor(item.x)).padStart(2," ")}, ${String(Math.floor(item.y)).padStart(2," ")}  h: ${item.health}}</li>\n`).join("");
  
  ul.innerHTML = html;

  document.querySelector("#enemies_length").textContent = enemies.length;
}

function showShotsInfo() {
  const ul = document.querySelector("#shots_info");
  const html = shots.map(item => `<li>{ ${String(Math.floor(item.x)).padStart(2," ")}, ${String(Math.floor(item.y)).padStart(2," ")} }</li>\n`).join("");
  
  ul.innerHTML = html;

  //document.querySelector("#enemies_length").textContent = enemies.length;
}

function showSpaceShipInfo() {
  document.querySelector("#spaceship_info").textContent = `{ ${String(Math.floor(spaceship.x)).padStart(2," ")}, ${String(Math.floor(spaceship.y)).padStart(2," ")} }`;
  
}

// *** MODELS ***

const spaceship = {
  x: 0,
  y: 0,
  speed: 20,
  energy: 100,
  firing: false
}

const enemies = []

const shots = []


// *** GRAPHICS ***

function displaySpaceShip() {
  spaceship.element.style.transform = `translate( ${spaceship.x}vw, ${spaceship.y}vw)`;
}

function displayEnemies() {
  for(const enemy of enemies) {
    enemy.element.style.transform = `translate( ${enemy.x}vw, ${enemy.y}vw)`;
    enemy.element.style.setProperty("--health", enemy.health);
  }
}

function displayShots() {
  for(const shot of shots) {
    shot.element.style.transform = `translate( ${shot.x}vw, ${shot.y}vw)`;
  }
}