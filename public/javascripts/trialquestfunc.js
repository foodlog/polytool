var perimeter = new Array();
var complete = false;
var canvas;
var ctx;
var peritmeters = [];
var tags = [];
var person = "";
var bigBox;
var smallBox;

var trialDone = false;
// There's probably a much cleaner way of doing this, but this is just temporary to simplify debugging
// T = Top | B = Bottom // L = Left | R = Right // x = X-axis | y = Y-axis

// Big box dimensions
var big_TLx = 277;
var big_BLx = 277;
var big_TRx = 471;
var big_BRx = 471;
var big_TRy = 127;
var big_TLy = 127;
var big_BLy = 299;
var big_BRy = 299;

// Small box dimensions

var small_TLy = 156;
var small_TRy = 156;
var small_BLx = 326;
var small_TLx = 326;
var small_BRx = 427;
var small_TRx = 427;
var small_BRy = 232;
var small_BLy = 232;

function doChecks(perimeter)
{
    var perimeterArray = [];
    for(var i = 0; i < perimeter.length;i++)
    {
        perimeterArray.push(perimeter[i].x)
        perimeterArray.push(perimeter[i].y)
    }
    var xPositions = x_positions(perimeterArray)
    var yPositions = y_positions(perimeterArray)
    bigBox = big_box(xPositions[2],xPositions[1],yPositions[2],yPositions[1])
    smallBox = small_box(xPositions[0],yPositions[0])
    if(bigBox == true && smallBox == true)
        return true
    else 
        return false
}

function x_positions(perimeter) { // Creates an array containing only the X-axis values
    xpo = perimeter.filter(function(value, index, Arr) { // The array containing X-axis
        return index % 2 == 0;
    });

    xpo_max = Math.max(...xpo); // largest value of xpo

    xpo_min = Math.min(...xpo);// smallest value of xpo
    
    return [xpo,xpo_max,xpo_min]
}

function y_positions(perimeter) { // Creates an array containing only the Y-axis values
    ypo = perimeter.filter(function(value, index, Arr) { // The array containing X-axis
        return index % 2 == 1;
    });
    ypo_max = Math.max(...ypo); // largest value of ypo

    ypo_min = Math.min(...ypo); // smallest value of ypo
    return [ypo,ypo_max,ypo_min]
}

function big_box(xpo_min,xpo_max,ypo_min,ypo_max) { // Checks if the polygon dimensions fit within the big box
    
    console.log("xpo min = " + xpo_min + "big_BLx = " + big_BLx)
    console.log("xpo_max =" + xpo_max + "big_TRx ="+ big_TRx)
    console.log("ypo_min = " + ypo_min + "big_TRy = " + big_TRy)
    console.log("ypo_max=" + ypo_max + "big_BLy = " + big_BLy )
    
    if ((xpo_min > big_BLx) && (ypo_max < big_BLy) && (xpo_max < big_TRx) && (ypo_min > big_TRy)) {
        return true;
    }
}
function small_box(xpo,ypo) { // Checks if the polygon dimensions fits around the small box
    var i;
    var sb_status = false
    for (i = 0; i < xpo.length; i++) {
        
        console.log("xpo = " + xpo[i] + "ypo = " + ypo[i])
        console.log("small_BLx = " + small_BLx + "small_BRx = " + small_BRx)
        console.log("small_TLy =" + small_TLy + "small_BLy ="+ small_BLy)

        var outSmallBoxX = small_BLx > xpo[i] || xpo[i] > small_BRx
        var outSmallBoxY = small_TLy > ypo[i] || small_BLy < ypo[i]
        
        if ( (outSmallBoxX && (outSmallBoxY || !outSmallBoxY))  || (outSmallBoxY && (outSmallBoxX || !outSmallBoxX)) ) {
            sb_status = true;
        }
        else
        {
            return false;
        }
    }
    return sb_status
}
/*
function small_box(xpo,ypo) { // Checks if the polygon dimensions fits around the small box
    var i;
    var sb_status = false
    for (i = 0; i < xpo.length; i++) {
        console.log("xpo = " + xpo[i] + "ypo = " + ypo[i])
        console.log("small_BLx = " + small_BLx + "small_BRx = " + small_BRx)
        console.log("small_TLy =" + small_TLy + "small_BLy ="+ small_BLy)
        //If we're aiming for polygons then checking for the Y positions does not make sense
        //As in polygons there will be points not on the upper or lower sides
        if (((small_BLx > xpo[i]) || (xpo[i] > small_BRx)) && ((small_TLy > ypo[i]) || (small_BLy < ypo[i]))) {
            sb_status = true;
        } else {
            alert("Your annotation is not accurate enough, please try again.");
        }
    }
    return sb_status
}
*/

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

function undo() {
    ctx = undefined;
    perimeter.pop();
    complete = false;
    $("#submitButton").attr("disabled", "disabled");
    start(true);
}

function clear_canvas() {
    ctx = undefined;
    perimeter = new Array();
    complete = false;
    $("#submitButton").attr("disabled", "disabled");
    document.getElementById('coordinates').value = '';
    start();
}

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

async function point_it(event) {
    var rect, x, y;
    if (event.ctrlKey) {
        //for faster undo use ctrl+click
        undo();
        return false;
    } else if (event.which === 3 || event.button === 2) {
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
        if(await doChecks(perimeter) == false){
            alert('Your annotation is not accurate enough, please try again.')
            clear_canvas();
            return false
        }
        else {
        draw(true);
        prompt("Annotaion completed successfully, redirecting you to your survey!");
        let url = window.location.toString().split('/')
        window.location = url[0] + "//" + url[2] + "/survey/" + surveyUrl
        event.preventDefault();
        return false;
        }
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

function start(with_draw) {
    canvas = document.getElementById("jPolygon");
    var img = new Image();
    img.src = canvas.getAttribute('data-imgsrc');
    img.onload = function() {
        // img.width = getElementById("imgcard");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (with_draw == true) {
            draw(false);
        }
    }
}


// Buttons functionality
$("#submit_button").click(function(e) {
    
});
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
