/*
  Warrain.js - https://github.com/Yogsther/warrain.js
  Tab spaces: 2

  Guide to understanding the engine

  Input: Look for the array keysDown, in there all currently pressed keys will be stored!

  Render: To render something, it has to be in the "renderArray"
  to add it, just use renderArray.push({"Your object"});
  It has to have x: and y: coordiantes aswell as a texture varaible.

  Structure for a render object is:
  { x: 0,
    y: 0,
    texture: texture_name,
    type: "player", "npc", "background", "ui",  "object" or "block"
  }

    player: player controlled by a human
    npc: monster or friendly characters scattered around the world.
    background: will render in the background, pure texture.
    object: something that the player can walk behind, example a tree. No collision
    block: full collision, players cant walk across it.
    ui: User interface - This will be static and not effected by the camera. Always rendered ontop.
    ?effected ui: for damage visuals and player name tags, ui that renderes ontop but is effected by the camera position.
*/

// Setup canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = window.screen.availWidth * 0.7;
canvas.height = canvas.width * 0.56;


// Map array from map.js
var map = mapRaw;

var viewport; // This is the current viewport, depending on camera location. This is used to know what to render, and not render objects outside of the viewport.


var renderArray = [];
var keysDown = []; // In this array, all the keycodes to the keys currently pressed down.

/*
Store all textures in this array as objects.y
*/
var textures = texturesRaw;

window.onload = new function(){
  // Run onload
  loadTextures(); // Load textures
  inputHandler(); // Initiate inputHandler
  mouseClickHandler(); // Initate mouseHandler
}

// Push texture positions here!
// Later this will be pushed from the server.

var player_x = 0;
var player_y = 0;
var player_speed = 2;



/*
Main game engine ☢
*/

var camera = {
  x: player_x,
  y: player_y
}

// Variables for getting the fps
var lastFpsCheck = 0;
var fps = 0;

heartbeat(); // Start heartbeat / render tick

/*
  This function will load all defined textures in the "textures" array and make them variables after their names.
*/
function loadTextures(){
    for(var i = 0; i < textures.length; i++){
      // Run functions as strings to define textures.
      eval("window." + textures[i].name + " = new Image;");
      eval(textures[i].name + ".src = '" + textures[i].src + "';");
    }
}


function inputHandler(){
  /* Input handler */
  document.addEventListener('keydown', function(event){
    if(keysDown.indexOf(event.keyCode) == -1){
      keysDown.push(event.keyCode);
    }
  });
  document.addEventListener('keyup', function(event){
    keysDown.splice(keysDown.indexOf(event.keyCode), 1);
  });
}


var mousedown = false;
var mousePos;

function mouseClickHandler(){

  window.drawWaypoint = {
    active: false,
    x: 0,
    y: 0
  }; // The X that the player will go to.


  canvas.addEventListener("mousemove", function(event){
    mousePos = getMousePos(canvas, event); // Update mousePos every time the mouse moves.
  });

  canvas.addEventListener("click", function(event){
    addWaypoint(mousePos.x, mousePos.y); // When mouse is clicked on the canvas. (Click to move)
  });

  // Mouse hold, writes to boolean when mouse is held down.
  $(canvas).on('mousedown mouseup', function mouseState(e) {
    if (e.type == "mousedown") {
      mousedown = true;
    } else {
      mousedown = false;
      }
    });
  }

function getMousePos(canvas, evt) {
  // Don't use this function - It's only a complimentary to the mousemove listener.
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
  };
}
// Add a waypoint that the player will walk towards
function addWaypoint(x, y){
  drawWaypoint.active = true;
  drawWaypoint.x = Math.round(x + camera.x - canvas.width / 2) - 15;
  drawWaypoint.y = Math.round(y + camera.y - canvas.height / 2) - 15;
}


// This function is to define what to do when keys are pressed and what to do.
function inputAction(){


  document.getElementById("coordinates_index").innerHTML = "x: " + Math.round(player_x) + " y: " + Math.round(player_y); //Draw coordiantes


  // TODO Remove or Tweak thsese. Since walking with keys is faster and unbalanced!
  if(keysDown.indexOf(87) != -1) player_y += -player_speed; // W
  if(keysDown.indexOf(83) != -1) player_y += player_speed; // S
  if(keysDown.indexOf(65) != -1) player_x += -player_speed; // A
  if(keysDown.indexOf(68) != -1) player_x += player_speed; // D

  var cameraSpeed = 2;
  var cameraLimit_x = 150;
  var cameraLimit_y = 80;

  /*
    Camera follow
  */

  // Camera y
  if(player_y - camera.y > cameraLimit_y){
      camera.y += cameraSpeed;
  }
  if(player_y - camera.y < (cameraLimit_y*-1)){
      camera.y -= cameraSpeed;
  }
  // Camera x
  if(player_x - camera.x > cameraLimit_x){
      camera.x += cameraSpeed;
  }
  if(player_x - camera.x < (cameraLimit_x*-1)){
      camera.x -= cameraSpeed;
  }


}


function moveToWaypoint(){
  // TODO Pathfinding
  /*
  This code will just correct the poistion of the player to the position of the waypoint.
  Straight forward pathfinding, and this may be enough. I don't know - I guess movement will be
  a bit more involved. We can't do pathfinding until we have setup collisisons.
  */
  var speed_x = player_speed;
  var speed_y = Math.abs((drawWaypoint.y - player_y) / (drawWaypoint.x - player_x)) * player_speed;
  if(speed_y > player_speed) {
    speed_x = (player_speed / speed_y);
    speed_y = player_speed;
  }
  if(drawWaypoint.x > player_x) {
    player_x += speed_x;
  }
  if(drawWaypoint.y > player_y) {
    player_y += speed_y;
  }
  if(drawWaypoint.y < player_y) {
    player_y -= speed_y;
  }
  if(drawWaypoint.x < player_x) {
    player_x -= speed_x;
  }

  if(Math.abs(player_x - drawWaypoint.x) < player_speed && Math.abs(player_y - drawWaypoint.y) < player_speed) {
    drawWaypoint.active = false;
  }
}

/*
Main heartbeat or render tick - This will run constanly, 60 times a second while
connected to the server and is essential!
*/

function heartbeat(){

    // Clear render renderArray
    renderArray = [];
    inputAction();

    viewport = {
        x0: camera.x + canvas.width / 2 - canvas.width - 100,
        x1: camera.x + canvas.width / 2 + 100,
        y0: camera.y + canvas.height / 2 - canvas.height - 100,
        y1: camera.y + canvas.height / 2 + 100
    };

    /*
      Movement - Walk to point
    */
      if(drawWaypoint.active){
        moveToWaypoint();
      }

      if(mousedown){
          addWaypoint(mousePos.x, mousePos.y);
      }

    // Push texutres here.
    // This will be done from a server later when we get online boiiii
    // TODO loading loop for online
    renderArray.push({
      x: player_x,
      y: player_y,
      texture: "player_test",
      type: "player"
    });

    // Render waypoint, this needs to be rendered last since it's a part of the GUI.
    if(drawWaypoint.active){
      //ctx.drawImage(waypoint, drawWaypoint.x, drawWaypoint.y);
      renderArray.push({
        x: drawWaypoint.x,
        y: drawWaypoint.y,
        texture: "waypoint"
      });
    }



    /* Render part
    Clear canvas for new rendered
    */
    ctx.fillStyle = "#48bf52"; // TODO may want to change this color.
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // Save the map that is visible in the viewport.
    var tempRenderArray = [];
    for(var i = 0; i < map.length; i++){
      var renderArr = map;
      if(renderArr[i].x < viewport.x1 && renderArr[i].y < viewport.y1 && renderArr[i].x > viewport.x0 && renderArr[i].y > viewport.y0){
        // Item is in the viewport
        tempRenderArray.push(renderArr[i]);
      }
    }
    // Store items, characters and other objects from the renderArray, all temporary items in the world.
    for(var i = 0; i < renderArray.length; i++){
      var renderArr = renderArray;
      if(renderArr[i].x < viewport.x1 && renderArray[i].y < viewport.y1 && renderArray[i].x > viewport.x0 && renderArray[i].y > viewport.y0){
        // Item is in the viewport
        tempRenderArray.push(renderArr[i]);
      }
    }




    // Render everything in the renderArray
    for(var i = 0; i < tempRenderArray.length; i++){
      var x = tempRenderArray[i].x - camera.x + canvas.width / 2; // + canvas.width is to center the player in the middle of the screen.
      var y = tempRenderArray[i].y - camera.y + canvas.height / 2;
      eval("ctx.drawImage(" + tempRenderArray[i].texture + ", " + x + ", " + y + ");");

    }


    fps++; // Increese fps counter

    var now = Date.now(); // Current time in millis
    if((now - lastFpsCheck) > 1000){
        // Check the fps every second
        document.getElementById("fps").innerHTML = (fps) + " fps"; // Print out fps
        lastFpsCheck = now; // Log last time checked
        fps = 0; // Reset fps
    }


    requestAnimationFrame(heartbeat); // Run this 60 times a second.
}
