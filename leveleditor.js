/* Welcome to the Level editor, this is bodged to hell - so be carefull */

// !!! Update textures array when new textures are added! (copy paste)



// Setup canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

/* Remove antialiasing when upscaling images. */
ctx.imageSmoothingEnabled = false; // Standard
ctx.mozImageSmoothingEnabled = false; // Firefox

// Set height and width for canvas
canvas.width = 800;
canvas.height = 500;



var map = mapRaw; // Import map
var textures = texturesRaw; // Import textures


loadTextures(); // Add texture variables

function loadTextures(){
    for(var i = 0; i < textures.length; i++){
      // Run functions as strings to define textures.
      eval("window." + textures[i].name + " = new Image;");
      eval(textures[i].name + ".src = '" + textures[i].src + "';");

        document.getElementById("debug_div").innerHTML += "<button style='height: 50px; width: 50px; position: relative; background-image: url(" + textures[i].src + ")' id='" + textures[i].name + "' title='" + textures[i].name + "' onclick='chooseTexture(this.id)'></button>";
    }
}

var lastMousePos = {
  x: 0,
  y: 0
};
 canvas.addEventListener("mousemove", function(event){
    mousePos = getMousePos(canvas, event); // Update mousePos every time the mouse moves.
    if(grid){
      while(Math.round(mousePos.x + camera.x - canvas.width / 2) % 64){
        mousePos.x += 1;
      }
      while(Math.round(mousePos.y + camera.y - canvas.height / 2) % 64){
        mousePos.y += 1;
      }
    }

    // Right click down
    if(mousedown){
      camera.x += lastMousePos.x - mousePos.x;
      camera.y += lastMousePos.y - mousePos.y;
    }
    lastMousePos = mousePos;
    document.getElementById("coordinates").innerHTML = "x: " + Math.round(mousePos.x + camera.x - canvas.width / 2) + " y: " + Math.round(mousePos.y + camera.y - canvas.height / 2);
});


function getMousePos(canvas, evt) {
  // Don't use this function - It's only a complimentary to the mousemove listener.
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
  };
}

canvas.addEventListener("click", function(event){
    map.push({
        x: Math.round(mousePos.x + camera.x - canvas.width / 2 - eval(currentTexture).width/2),
        y: Math.round(mousePos.y + camera.y - canvas.height / 2 - eval(currentTexture).height/2),
        texture: currentTexture
    });

    loadMapIndex();
});

loadMapIndex();
function loadMapIndex(){
    document.getElementById("dropbox").innerHTML = "";
    for(var i = map.length - 1; i > -1; i -= 1){
        document.getElementById("dropbox").innerHTML += '<span class="drop">' + map[i].texture + ' | ' + map[i].x + ', ' + map[i].y + ' <a onclick="remove(' + map[i].x + ',' + map[i].y + ')" title="DELETE THIS" style="color: red; cursor:pointer;">X</a></span>';
    }
}

function remove(x,y){
    var notfound = true;
    var i = 0;
    while(notfound){
        if(map[i].x == x && map[i].y == y){
            notfound = false;
            break;
        }
        i++
        if(i > map.length){
            console.error("Error! - err code 420:69 CALL OLLE!");
            return;
        }
    }
   map.splice(i, 1);
    loadMapIndex();


}

var currentTexture = textures[0].name;
function chooseTexture(textureName){
    currentTexture = textureName;
}
var keysDown = [];



var camera = {
    x: 0,
    y: 0
};




heartbeat();
inputHandler();



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

$("#canvas").mouseup(function(e){
    if( e.button == 2 ) {
      mousedown = false;
      canvas.style.cursor = "pointer";
    }
  });
  $("#canvas").mousedown(function(e){
      if( e.button == 2 ) {
      mousedown = true;
      canvas.style.cursor = "move";
      }
    });

  $('#canvas').bind('contextmenu', function(e){
    return false;
});
var grid;
async function heartbeat(){

    // Clear render renderArray
    renderArray = [];


    if(keysDown.indexOf(87) != -1) camera.y += -1;   // W
    if(keysDown.indexOf(83) != -1) camera.y += 1;    // S
    if(keysDown.indexOf(65) != -1) camera.x += -1;   // A
    if(keysDown.indexOf(68) != -1) camera.x += 1;    // D

        // Go faster when holding shift.
    if(keysDown.indexOf(16) != -1){
        if(keysDown.indexOf(87) != -1) camera.y += -1;   // W
        if(keysDown.indexOf(83) != -1) camera.y += 1;    // S
        if(keysDown.indexOf(65) != -1) camera.x += -1;   // A
        if(keysDown.indexOf(68) != -1) camera.x += 1;    // D
    }





    // Push texutres here.
    // This will be done from a server later when we get online boiiii
    // TODO loading loop for online

    for(var i = 0; i < map.length; i++){
        renderArray.push(map[i]);
    }

    /* Render part
    Clear canvas for new rendered
    */
    ctx.fillStyle = "#48bf52"; // TODO may want to change this color.
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 1;
    // Render everything in the renderArray
    for(var i = 0; i < renderArray.length; i++){
      var x = renderArray[i].x - camera.x + canvas.width / 2; // + canvas.width is to center the player in the middle of the screen.
      var y = renderArray[i].y - camera.y + canvas.height / 2;
      eval("ctx.drawImage(" + renderArray[i].texture + ", " + x + ", " + y + ");");

    }

    try{
    // Cursor or Active item
    ctx.globalAlpha = 0.5;
    ctx.drawImage(eval(currentTexture), mousePos.x - eval(currentTexture).width/2, mousePos.y - eval(currentTexture).height/2);
    } catch(e){

    }

    // Draw grid
    grid = document.getElementById("snapgrid").checked;
    if(grid){
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      // Draw horizontal 1000 lines
      // Title size 32x32 - upscaled to 64x64
      for(var i = -1000; i < 1000; i++){
        ctx.fillRect(i*64 + 47 - camera.x, 0, 1, 1000);
      }
      for(var i = -1000; i < 1000; i++){
        ctx.fillRect(0, i*64 - 39 - camera.y, 1000, 1);
      }
    }+




    await sleep(10); // Wait for for 1/30 of a second
    heartbeat(); // Run heartbeat again

}
document.getElementById("snapgrid").checked = true;

// Sleep function, stolen from Overstacked
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function exportLevel(){
    copyToClipboard("/* This is the only string that should be present in map.js! */ \nvar mapRaw = " + JSON.stringify(map) + ";");
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}
