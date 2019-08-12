var perimeter = new Array();
var complete = false;
var canvas;
var ctx;
var perimeters = [];
var output = [];
var imageNumber = 0;
var tags = [];
var person = "";

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

function doChecks(perimeter,coordinates)
{
    var perimeterArray = [];
    var perimeter = perimeter[0]
    for(var i = 0; i < perimeter.length;i++)
    {
        console.log(i)
        perimeterArray.push(perimeter[i].x)
        perimeterArray.push(perimeter[i].y)
    }
    console.log(coordinates)
    var maxY = [coordinates[0]+30,coordinates[0]-30]
    var maxX = [coordinates[1]+30,coordinates[1]-30]
    var minY = [coordinates[2]+30,coordinates[2]-30]
    var minX = [coordinates[3]+30,coordinates[3]-30]
    var bigPoints = [minX[1],maxX[0],minY[1],maxY[0]]
    var smallPoints = [minX[0],maxX[1],minY[0],maxY[1]]
    var xPositions = x_positions(perimeterArray)
    var yPositions = y_positions(perimeterArray)
    var bigBox = big_box(xPositions[2],xPositions[1],yPositions[2],yPositions[1],bigPoints)
    var smallBox = small_box(xPositions[0],yPositions[0],smallPoints)
    if(bigBox == true && smallBox == true)
        return true
    else 
        return false
}
function big_box(xpo_min,xpo_max,ypo_min,ypo_max,bigPoints) { // Checks if the polygon dimensions fit within the big box
    
    console.log("xpo min = " + xpo_min + "big_BLx = " + bigPoints[0])
    console.log("xpo_max =" + xpo_max + "big_TRx ="+ bigPoints[1])
    console.log("ypo_min = " + ypo_min + "big_TRy = " + bigPoints[2])
    console.log("ypo_max=" + ypo_max + "big_BLy = " + bigPoints[3] )
    
    if ((xpo_min > bigPoints[0]) && (ypo_max < bigPoints[3]) && (xpo_max < bigPoints[1]) && (ypo_min > bigPoints[2])) {
        return true;
    }
}
function small_box(xpo,ypo,smallPoints) { // Checks if the polygon dimensions fits around the small box
    var i;
    var sb_status = false
    for (i = 0; i < xpo.length; i++) {
        
        console.log("xpo = " + xpo[i] + "ypo = " + ypo[i])
        console.log("small_BLx = " + smallPoints[0] + "small_BRx = " + smallPoints[1])
        console.log("small_TLy =" + smallPoints[2] + "small_BLy ="+ smallPoints[3])

        var outSmallBoxX = smallPoints[0] > xpo[i] || xpo[i] > smallPoints[1]
        var outSmallBoxY = smallPoints[2] > ypo[i] || smallPoints[3] < ypo[i]
        
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

//
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
        while (person == null && person == "" || (input.possibleAnnotations != undefined && input.possibleAnnotations.length != 0 && !input.possibleAnnotations.includes(person))) {
            person = prompt("Polygon Closed, please enter the tag");
        }
        perimeters.push(perimeter)
        tags.push(person);
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

async function submitButton(){
    let canvas = document.getElementById("jPolygon");
    let imageURL = canvas.getAttribute('data-imgsrc');
    if(input.images[imageNumber].coordinates != undefined){
            var trueOrNot = await doChecks(perimeters,input.images[imageNumber].maxMins)
        if(trueOrNot == false){
            alert('Your annotation is not accurate enough, please try again.')
            clear_canvas();
            return false
        }
        else
        {
            imageNumber = imageNumber + 1
            perimeters = []
            tags = []
            clear_canvas();
        }

    }
    else 
    {
        output.push({
            tags:tags, 
            coordinates: perimeters,
            imageUrl: imageURL
        })
        imageNumber = imageNumber + 1
    }
    let surveyUrl = window.location.pathname.split('/')[2]
    let url = window.location.toString().split('/')
    if(imageNumber == input.images.length)
    {
        $.ajax({
            type: "POST",
            url: url[0] + "//" + url[2] + "/surveySubmit/" +surveyUrl,
            complete: function(){
                window.location = url[0] + "//" + url[2] + "/surveyDone/"+surveyUrl
            },
            contentType: 'application/json',
            data: JSON.stringify(output)
          });
          return true;
    }
    else
    {
        canvas = document.getElementById("jPolygon");
        canvas.setAttribute('data-imgsrc',input.images[imageNumber].imageUrl);
        perimeters = []
        tags = []
        clear_canvas();
    }
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
        perimeters = []
        tags = []
    });

    $("#undo_button").click(function(e) {
        undo();
    });

    $("#help_button").alert("This is an alert");

    $("#submitButton").attr("disabled", "disabled");
    $("#submitButton").detach().appendTo("#buttons");
});

function undoButton() {
    undo();
    }