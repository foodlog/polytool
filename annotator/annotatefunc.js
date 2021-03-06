var perimeter = new Array();
var complete = false;
var canvas;
var ctx;
var perimeters = [];
var tags = [];
var person = "";

function line_intersects(p0, p1, p2, p3) {
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1['x'] - p0['x'];
    s1_y = p1['y'] - p0['y'];
    s2_x = p3['x'] - p2['x'];
    s2_y = p3['y'] - p2['y'];
    var s, t;
    s = (-s1_y * (p0['x'] - p2['x']) + s1_x * (p0['y'] - p2['y'])) / (-s2_x * s1_y + s1_x * s2_y);
    t = (s2_x * (p0['y'] - p2['y']) - s2_y * (p0['x'] - p2['x'])) / (-s2_x * s1_y + s1_x * s2_y);
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return true; // Collision detected
    }
    return false; // No collision
}

function point(x, y) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.moveTo(x, y);
}

// undo basically clears the canvas and then starts a new canvas and draw the old figures in it
function undo() {
    clear_canvas(true);
    complete = false;
}
// when this is used for undo, make sure to draw old figures
function clear_canvas(undoVal) {
    ctx = undefined;
    perimeter = new Array();
    complete = false;
    $("#submitButton").attr("disabled", "disabled");
    document.getElementById('coordinates').value = '';
    start(false,undoVal);
}

// drawAll draws every figure in the perimeters array, which is the entire figure list until the last uncomplete figure
function drawAll() {
    for(var j = 0;j < perimeters.length;j++) {
        perimeter = new Array();
        for (var i = 0; i < perimeters[j].length+1; i++) {
            if (i == perimeters[j].length) {
                draw(true,perimeter)
                break;
            } else {
                perimeter.push(perimeters[j][i])
                draw(false,perimeter)
            }

        }
    }
    perimeter = new Array();
}

// deleted the "Complete" part of the if statement, it was causing a multiple mouse click problem
function draw(end) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.lineCap = "square";
    ctx.beginPath();
    for (var i = 0; i < perimeter.length; i++) {
        if (i == 0) {
            ctx.moveTo(perimeter[i]['x'], perimeter[i]['y']);
            end || point(perimeter[i]['x'], perimeter[i]['y']);
        } else {
            ctx.lineTo(perimeter[i]['x'], perimeter[i]['y']);
            end || point(perimeter[i]['x'], perimeter[i]['y']);
        }
    }
    if (end) {
        ctx.lineTo(perimeter[0]['x'], perimeter[0]['y']);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'blue'; // Change colours for different polygons??
        complete = true;
        // Enable submit button and draw polygon
        $("#submitButton").removeAttr("disabled"); // We should include a hover or perminant display of the tag
    }
    ctx.stroke();
    // print coordinates
    if (perimeter.length == 0) {
        document.getElementById('coordinates').value = '';
    } else {
        document.getElementById('coordinates').value = JSON.stringify(perimeter);
    }
}

function check_intersect(x, y) {
    if (perimeter.length < 4) {
        return false;
    }
    var p0 = new Array();
    var p1 = new Array();
    var p2 = new Array();
    var p3 = new Array();
    p2['x'] = perimeter[perimeter.length - 1]['x'];
    p2['y'] = perimeter[perimeter.length - 1]['y'];
    p3['x'] = x;
    p3['y'] = y;
    for (var i = 0; i < perimeter.length - 1; i++) {
        p0['x'] = perimeter[i]['x'];
        p0['y'] = perimeter[i]['y'];
        p1['x'] = perimeter[i + 1]['x'];
        p1['y'] = perimeter[i + 1]['y'];
        if (p1['x'] == p2['x'] && p1['y'] == p2['y']) {
            continue;
        }
        if (p0['x'] == p3['x'] && p0['y'] == p3['y']) {
            continue;
        }
        if (line_intersects(p0, p1, p2, p3) == true) {
            return true;
        }
    }
    return false;
}

function point_it(event) {
    var rect, x, y;
    if (event.ctrlKey) {
        //for faster undo use ctrl+click
        undo();
        return false;
    } else if (event.which === 3 || event.button === 2) {
        perimeters.push(perimeter)
        tags.push(person);
        //atempt to close polygon
        if (perimeter.length == 2) {
            alert('You need at least three points for a polygon');
            return false;
        }
        x = perimeter[0]['x'];
        y = perimeter[0]['y'];
        if (check_intersect(x, y)) {
            alert('The line you are drawing intersect another line');
            return false;
        }
        draw(true);
        person = prompt("Polygon Closed, please enter the tag");
        while (person == null || person == "") {
            person = prompt("Polygon Closed, please enter the tag");
        }
        console.log(perimeter)
        perimeter = new Array();
        event.preventDefault();
        return false;
    } else {
        rect = canvas.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        if (perimeter.length > 0 && x == perimeter[perimeter.length - 1]['x'] && y == perimeter[perimeter.length - 1]['y']) {
            // same point - double click
            return false;
        }
        if (check_intersect(x, y)) {
            alert('The line you are drawing intersect another line');
            return false;
        }
        perimeter.push({
            'x': x,
            'y': y
        });
        draw(false);
        return false;
    }
}

function start(with_draw,isUndo) {
    canvas = document.getElementById("jPolygon");
    // imgcard = document.getElementById("imgcard");
    var img = new Image();
    img.src = canvas.getAttribute('data-imgsrc');
    img.onload = function() {
        // img.width = getElementById("imgcard");
        // canvas.width = imgcard.style.width;
        // img.width = imgcard.style.width;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (with_draw == true) {
            draw(false);
        }
        if(isUndo){
            drawAll()
        }
    }
}

function myFunction() {
    alert(" mouse left button to click & connect points \n mouse right button to complete polygon \n CTRL + mouse click to remove the last point ");
}

function submitButton(){
    console.log(perimeters);
    console.log(tags);
    alert("You have successfully submitted your annotations.")
}

// Buttons functionality
$(document).ready(function() {
    // Create variables
    var perimeter = new Array();
    var complete = false;
    var canvas = document.getElementById("jPolygon");
    var ctx;
    var img = new Image();
    img.src = canvas.getAttribute('data-imgsrc');

    clear_canvas();

    // Initialize buttons
    $("#reset_button").click(function(e) {
        clear_canvas();
    });

    $("#undo_button").click(function(e) {
        undo();
    });



    $("#submitButton").attr("disabled", "disabled");
    $("#submitButton").detach().appendTo("#buttons");
});

function undoButton() {
    undo();
    }
