/*
  Warrain.js - https://github.com/Yogsther/warrain.js

  Guide to understanding the engine

  Input: Look for the array keysDown, in there all currently pressed keys will be stored!

  Render: To render something, it has to be in the "renderArray"
  to add it, just use renderArray.push({"Your object"});
  It has to have x: and y: coordiantes aswell as a texture varaible.

  Structure for a render object is:
  { x: 0,
    y: 0,
    texture: texture_name }

*/

// Setup canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = window.screen.availWidth * 0.7;
canvas.height = canvas.width * 0.56;


var renderArray = [];
var keysDown = []; // In this array, all the keycodes to the keys currently pressed down.

/*
Store all textures in this array as objects.
*/
var textures = [{
  name: "player_test",
  src: "spr/player_def_test.png"
}, {
  name: "tree_test",
  src: "spr/tree_test.png"
}, {
  name: "waypoint",
  src: "spr/waypoint.png"
}];

window.onload = new function(){
  // Run onload
  loadTextures(); // Load textures
  inputHandler(); // Initiate inputHandler
  mouseClickHandler(); // Initate mouseHandler
}

// Push texture positions here!
// Later this will be pushed from the server.

var player_x = canvas.width / 2;
var player_y = canvas.height / 2;
var player_speed = 1;

//TODO REMOVE THIS, JUST A TEST
var trees = [];
treeSpawn();
function treeSpawn(){
  for(var i = 0; i < 100; i++){
    // Spawn 100 trees
    trees.push({
      x: Math.floor(Math.random()*1000),
      y: Math.floor(Math.random()*1000),
      texture: "tree_test"
    });
  }
}


/*
Main game engine ☢
*/

var camera = {
  x: player_x,
  y: player_y
}

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
  drawWaypoint.x = Math.round(x + camera.x - canvas.width / 2);
  drawWaypoint.y = Math.round(y + camera.y - canvas.height / 2);
}


// This function is to define what to do when keys are pressed and what to do.
function inputAction(){

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
async function heartbeat(){

    // Clear render renderArray
    renderArray = [];
    inputAction();

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
      texture: "player_test"
    });

    // TODO REMOVE ONLY TEST
    for(var i = 0; i < trees.length; i++){
      renderArray.push({
        x: trees[i].x,
        y: trees[i].y,
        texture: trees[i].texture
      });
    }

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

    // Render everything in the renderArray
    for(var i = 0; i < renderArray.length; i++){
      var x = renderArray[i].x - camera.x + canvas.width / 2; // + canvas.width is to center the player in the middle of the screen.
      var y = renderArray[i].y - camera.y + canvas.height / 2;
      eval("ctx.drawImage(" + renderArray[i].texture + ", " + x + ", " + y + ");");
    }






    await sleep(0,032); // Wait for for 1/60 of a second
    heartbeat(); // Run heartbeat again

}

// Sleep function, stolen from Overstacked
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
