var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var inputs = [];

var storeInput = function(event, tool, params){
    var inputFrame = {
        time: new Date().getTime(),
        event: event,
        tool: tool,
        params: params
    }
    inputs.push(inputFrame);
}

var pencilTool = { 
    onMouseDown: function(pos, radius, color){
        drawCircle(pos.x, pos.y, radius, color);
    },
    
    onMouseMove: function(pos, last_pos, radius, color){
        var x = pos.x - last_pos.x;
        var y = pos.y - last_pos.y;
        var movement = Math.sqrt(x * x + y * y);
        if(movement > 2){
            var step = 1 / movement;
            for(var i = 0; i <= 1; i += step){
                var p = lerpVec2(last_pos, pos, i);
                drawCircle(p.x, p.y, radius, color);
            }
        }
        drawCircle(pos.x, pos.y, radius, color);
    },
    
    onMouseUp: function(pos, radius, color){
        drawCircle(pos.x, pos.y, radius, color);
    }
}

var activeTool = pencilTool;
var r = 3;
var c = "#0022aa";

function clear(){
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    inputs = [];
}

var drawCircle = function(x, y, radius, color){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

var lerp = function(a, b, t){
    return a + t * (b - a);
}

var lerpVec2 = function(vec1, vec2, t){
    var c = {
        x : lerp(vec1.x, vec2.x, t),
        y : lerp(vec1.y, vec2.y, t)
    };
    return c;
}

var lastPosition ={x: -1, y: -1};

canvas.addEventListener('mousedown', function(e) {
    var rect = canvas.getBoundingClientRect();
    lastPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    }
    activeTool.onMouseDown(lastPosition, r, c);
    storeInput("mousedown", activeTool.onMouseDown, [{...lastPosition}, r, c]);
});

canvas.addEventListener('mousemove', function(e) {
    if(lastPosition.x != -1 && lastPosition.y != -1){
        var rect = canvas.getBoundingClientRect();
        var pos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
        activeTool.onMouseMove(pos, lastPosition, r, c);
        storeInput("mousemove", activeTool.onMouseMove, [{...pos}, {...lastPosition}, r, c]);
        lastPosition = pos;
    }
});

canvas.addEventListener('mouseup', function(e) {
    var rect = canvas.getBoundingClientRect();
    var pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    }
    activeTool.onMouseUp(pos, r, c);
    lastPosition ={x: -1, y: -1};
    storeInput("mouseup", activeTool.onMouseUp, [{...pos}, r, c]);
});

canvas.addEventListener('mouseout', function(e) {
    lastPosition ={x: -1, y: -1};
});

var playBack = function(f){
    var frame = inputs[f];
    frame.tool(...frame.params);
    if(inputs.length > f + 1){
        setTimeout(function(){playBack(f + 1);}, 1);
    }
}

window.addEventListener('keypress', function(e) {
    switch(e.key){
        case " ":
            console.log(inputs);
            break;
        case "c":
            clear();
            break;
        case "p":
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            playBack(0);
    }
    
});