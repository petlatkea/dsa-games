"use strict";
window.addEventListener("load", start);

const BOARD_WIDTH = 24;
const BOARD_HEIGHT = 14;

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
  "TTT  f OT HHHHHH b      ",
  "TTWWWWW  TH////H  CCCC  ",
  " PW...Wb  H////H  CnCC  ",
  "T W...W   HH/HHH f *fR  ",
  "m WWDWWf    s PP        ",
  "    s Y  sssss          ",
  "+--+s  T sssss Y   ~~~  ",
  "+ffsssssssssss  R  ~    ",
  "+ff+s    sssssYY CC|CC f",
  "+--+s    sssss Y   RY ff",
  "b   s ~~  s        ~Y   ",
  "sssss ~~~~I~~~~~~~~~ Y  ",
  "      ~~~ s YYYY Y      ",
  "          s       RY    "
];

const fieldTypes = {
  ' ': 11,
  ' corners': 19,
  '.': 9,
  '.corners': 17,
  's': 10,
  'scorners': 18,
  '*': 18,
  'g': 64,  
  'G': 65,
  'f': 12,
  'T': 38,
  'P': 27,
  'p': 28,
  'W0': 0,
  'W3': 3,
  'W2': 2,
  'W1': 1,
  'H0': 4,
  'H1': 5,
  'H2': 6,
  'H3': 7,
  '/': 8,
  'D': 48,  
  'Y': 30,
  'O': 31,
  'b': 20,
  '+': 59,
  '-': 51,
  'm': 62,
  'M': 63,
  'R': 58,
  '~': 13,
  'I': 16,
  '|': 21,
  'C': 15,
  'n': 50,
  '#': 49
}

const fields = [];

function createFields() {
  let t = 0;
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    const row = level[y];
    console.log('');
    for (let x = 0; x < BOARD_WIDTH; x++) {
   //   console.log('x: ' + x);
      let f = row.charAt(x);
      let subtype = undefined;
      let corner = "";
      const above = level[y-1]?.charAt(x);
      const below = level[y+1]?.charAt(x);
      const left = level[y].charAt(x-1);
      const right = level[y].charAt(x+1);

      // special case for walls
      if(f=='W' || f=='H') {
        if(f!=above && f!=below) {
          f+="0";
        } else if(f!=above) {
          f+="3";
        } else if(f!=below) {
          f+="2";
        } else {
          f+="1";
        }
      } else 
      // special case for flooring
      if(f=='.') {
        subtype = "floor";
        if(f!=above && f!=left) {
          // top-left corner
          corner += "tl";
        } 
        if(f!=above && f!=right) {
          // top-right corner
          corner += "tr";
        } 
        if(f!=below && f!=left) {
          corner += "bl";
        }
        if(f!=below && f!=right) {
          corner += "br";
        }

      } else
      // special case for corners
      if(f==' ' || f=='s') {
        subtype = "sand/grass";
        let opposite = f==' '?'s':' ';
        if(above==opposite && left==opposite) {
          // top-left corner
          corner += "tl";
        }  if(above==opposite && right==opposite) {
          // top-right corner
          corner += "tr";
        }  if(below==opposite && left==opposite) {
          // bottom-left corner
          corner += "bl";
        }  if(below==opposite && right==opposite) {
          // bottom-right corner
          corner += "br";
        } 
        // TODO: Double corners ... like endings of paths
      }

      const field = {
        x: x,
        y: y,
        type: fieldTypes[f],
        subtype: subtype,
        corner: corner,
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
    v_field.style.setProperty("--tile", m_field.type);
    // Set background-position based on type
    // Tiles: W: 8 - H: 15
    const w = (m_field.type%8) * -100;
    const h = Math.floor(m_field.type/8) * -100;

    v_field.style.setProperty("--w", w+"%");
    v_field.style.setProperty("--h", h+"%");

    if(m_field.corner) {
      v_field.classList.add("corner");
      v_field.classList.add(m_field.corner);

      // corner-tile used for before 
      // - for sand and grass: same h*2, opposite w*2
      // - for flooring: same w*2, h+1*2
      if(m_field.subtype=="sand/grass") {
        if(w==-200) {
          v_field.style.setProperty("--corner-w","-600%");
        } else if(w==-300) {
          v_field.style.setProperty("--corner-w","-400%");
        }
        v_field.style.setProperty("--corner-h", h*2+"%");
        v_field.classList.add("overlay");
      } else {
        v_field.style.setProperty("--corner-w", w*2+"%");
        v_field.style.setProperty("--corner-h", (h-100)*2+"%");
      }

    }
   
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