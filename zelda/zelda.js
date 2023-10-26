"use strict";
window.addEventListener("load", start);

const BOARD_WIDTH = 24;
const BOARD_HEIGHT = 10;

function start() {
  console.log("Building Maze");

  buildBoard();

  createFields();

  displayFields();
}


// *** KEYBOARD HANDLING ***

// *** GAMELOOP ***

// *** MOVEMENT ***

// *** SETTINGS ***

// *** INFO ***

// *** BOARD / PLAYFIELD ***

const level = [
  "gggggfgfgggggggggggggggg",
  "ggggggfggggggggggggggggg",
  "gggggggggggggggfgggggggg",
  "gggggggggggggggggggggggg",
  "gggggggggggggggggggggggg",
  "ggggggfgggggggfggggggggg",
  "gggggggggggggggggggggggg",
  "gggggggggggggggggggggggg",
  "fggggggggggggggggggggggf",
  "ffggggggggggggggggggggff"
];

const fieldTypes = {
  'g': 27,
  'f': 20
}

const fields = [];

function createFields() {
  let t = 0;
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    const row = level[y];
    console.log('');
    for (let x = 0; x < BOARD_WIDTH; x++) {
      console.log('x: ' + x);
      const f = row.charAt(x);
      const field = {
        x: x,
        y: y,
        type: t++
        //type: fieldTypes[f]
      };
      fields.push(field);
    }
  }
}

function displayFields() {
  const visualfields = document.querySelectorAll("#board .field");
  for (let i = 0; i < visualfields.length; i++) {
    const v_field = visualfields[i];
    const m_field = fields[i];

    v_field.textContent = m_field.type;
    // Set background-position based on type
    // W: 8 - H: 15
    const w = (m_field.type%8) * -100;
    const h = Math.floor(m_field.type/8) * -100;

    v_field.style.backgroundPosition = `${w}% ${h}%`;

    
    
  }


}

// *** GRAPHICS ***

function buildBoard() {
  const board = document.querySelector("#board");
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const field = document.createElement("div");
      field.classList.add("field");
      board.appendChild(field);

      // ? Set type ?

    }
  }
  board.style.setProperty("--WIDTH", BOARD_WIDTH);
  board.style.setProperty("--HEIGHT", BOARD_HEIGHT);
}