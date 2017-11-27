// Setup canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 360;

/*
This is the array where all objects to render will be stored. Everything in this
array will be rendered in heartbeat()

Structure for a render object is:
{ x: 0,
  y: 0,
  texture: texture_name }
*/

var renderArray = [];
var keysDown = [];

/*
Store all textures in this array as objects.
*/
var textures = [{
  name: "player_test",
  src: "spr/player_def_test.png"
}, {
  name: "tree_test",
  src: "spr/tree_test.png"
}];

window.onload = new function(){
  // Run onload
  loadTextures(); // Load textures
  inputHandler(); // Initiate inputHandler
}

// Push texture positions here!
// Later this will be pushed from the server.

var player_x = canvas.width / 2;
var player_y = canvas.height / 2;
var player_speed = 2;

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
  x: 0,
  y: 0
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

// This function is to define what to do when keys are pressed and what to do.
function inputAction(){

  if(keysDown.indexOf(87) != -1) player_y += -player_speed; // W
  if(keysDown.indexOf(83) != -1) player_y += player_speed; // S
  if(keysDown.indexOf(65) != -1) player_x += -player_speed; // A
  if(keysDown.indexOf(68) != -1) player_x += player_speed; // D

  var cameraSpeed = 2;
  var cameraLimit_x = 150;
  var cameraLimit_y = 80;

  console.log(player_y - camera.y);
  // Camera y
  if(player_y - camera.y > cameraLimit_y){
      camera.y += cameraSpeed;
  }
  if(player_y - camera.y < (cameraLimit_y*-1)){
      camera.y -= cameraSpeed;
  }

  if(player_x - camera.x > cameraLimit_x){
      camera.x += cameraSpeed;
  }
  if(player_x - camera.x < (cameraLimit_x*-1)){
      camera.x -= cameraSpeed;
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




    /* Render part
    Clear canvas for new rendered
    */
    ctx.fillStyle = "#48bf52"; // TODO may want to change this color.
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render everything in the renderArray
    for(var i = 0; i < renderArray.length; i++){
      var x = renderArray[i].x - camera.x + canvas.width / 2;
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
