/* Welcome to the Level editor, this is bodged to hell - so be carefull */

// !!! Update textures array when new textures are added! (copy paste)

var textures = [{
  name: "player_test",
  src: "spr/player_def_test.png"
}, {
  name: "tree_test",
  src: "spr/tree_test.png"
}, {
  name: "waypoint",
  src: "spr/waypoint.png"
}, {
  name: "bush",
  src: "spr/bush.png"
}];

// Setup canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

window.onload = function(){
    loadTextures();
}

var map = [];

function loadTextures(){
    for(var i = 0; i < textures.length; i++){
      // Run functions as strings to define textures.
      eval("window." + textures[i].name + " = new Image;");
      eval(textures[i].name + ".src = '" + textures[i].src + "';");
        
        document.getElementById("debug_div").innerHTML += "<button style='height: 50px; width: 50px; position: relative; background-image: url(" + textures[i].src + ")' id='" + textures[i].name + "' title='" + textures[i].name + "' onclick='chooseTexture(this.id)'></button>";
    }
}


 canvas.addEventListener("mousemove", function(event){
    mousePos = getMousePos(canvas, event); // Update mousePos every time the mouse moves.
    document.getElementById("coordinates").innerHTML = "x: " + Math.round(mousePos.x) + " y: " + Math.round(mousePos.y);
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
        x: Math.round(mousePos.x + camera.x - canvas.width / 2),
        y: Math.round(mousePos.y + camera.y - canvas.height / 2),
        texture: currentTexture
    });
    
    document.getElementById("dropbox").innerHTML += '<span class="drop">' + currentTexture + ' | ' + Math.round(mousePos.x + camera.x - canvas.width / 2) + ', ' + Math.round(mousePos.y + camera.y - canvas.height / 2) + ' <a onclick="remove(' + Math.round(mousePos.x + camera.x - canvas.width / 2) + ',' + Math.round(mousePos.y + camera.y - canvas.height / 2) + ')" title="DELETE THIS" style="color: red; cursor:pointer;">X</a></span>';
});

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
        try{
            document.getElementById("dropbox").innerHTML = "";  
        } catch(e){
            
        }
        
    for(var i = 0; i < map.length; i++){
        document.getElementById("dropbox").innerHTML += '<span class="drop">' + map[i].texture + ' | ' + map[i].x + ', ' + map[i].y + ' <a onclick="remove(' + map[i].x + ',' + map[i].y + ')" title="DELETE THIS" style="color: red; cursor:pointer;">X</a></span>';
    }   
}

var currentTexture = textures[0].name;
function chooseTexture(textureName){
    currentTexture = textureName;
}
var keysDown = [];


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

var camera = {
    x: 0,
    y: 0
};



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
    ctx.drawImage(eval(currentTexture), mousePos.x, mousePos.y);
    } catch(e){
        
    }



    await sleep(10); // Wait for for 1/30 of a second
    heartbeat(); // Run heartbeat again

}

// Sleep function, stolen from Overstacked
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

