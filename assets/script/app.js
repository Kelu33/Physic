console.log("app.js");

let color0 = 'rgb(0, 0, 0)';
let color1 = 'rgb(65, 60, 105)';
let color2 = 'rgb(74, 71, 163)';
let color3 = 'rgb(112, 159, 176)';
let color4 = 'rgb(167, 197, 235)';

const canvas = document.querySelector('canvas');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;
let ctx = canvas.getContext('2d');

let scale = 1;
let currentZoom = 1;
let centerView = {'x' : width/2, 'y' : height/2};
let originX = -width, originY = -height;

canvas.addEventListener('click', function(e) {
    center(e.clientX, e.clientY);
})

function center(posX, posY) {
    originX -= posX;
    originY -= posY;
    ctx.translate(
        centerView['x'] - posX,
        centerView['y'] - posY
    );
}

canvas.addEventListener('mousewheel', function(e) {
    if (e.deltaY === - 100) {
        ctx.translate(centerView['x'], centerView['y']);
        ctx.scale(1.1, 1.1);
        ctx.translate(-centerView['x'], -centerView['y']);
    }
    if (e.deltaY === 100) {
        ctx.translate(centerView['x'], centerView['y']);
        ctx.scale(0.9, 0.9);
        ctx.translate(-centerView['x'], -centerView['y']);
    }
})

/*canvas.onmousewheel = function (event) {
    let wheel = event.wheelDelta/120;//n or -n
    let zoom = 0;
    if(wheel < 0)
    {
        zoom = 1/2;
        if(currentZoom == 1)
            return;
    }
    else
    {
        mouseX = event.clientX - canvas.offsetLeft;
        mouseY = event.clientY - canvas.offsetTop;
        zoom = 2;
        if(currentZoom == 32)
            return;
    }
    currentZoom *= zoom;
    ctx.translate(
        centerView['x'],
        centerView['y']
    );
    ctx.scale(zoom,zoom);
    ctx.translate(
        -( mouseX / scale + centerView['x'] - mouseX / ( scale * zoom ) ),
        -( mouseY / scale + centerView['y'] - mouseY / ( scale * zoom ) )
    );
    centerView['x'] = ( mouseX / scale + centerView['x'] - mouseX / ( scale * zoom ) );
    centerView['y'] = ( mouseY / scale + centerView['y'] - mouseY / ( scale * zoom ) );
    scale *= zoom;
}*/

let earth = new Celestial_Object(
    centerView['x'],
    centerView['y'],
    6.1 * Math.pow(10, 25), // kilograms
    24, // 1/100 kilometres
    null,
    null,
    color2,
    100,
    100,
);
let moon = new Celestial_Object(
    width/2,
    (height/2)-384.4,  // 1/1000 kilometres
    7.3 * Math.pow(10, 23),
    7,
    3.2,
    0,
    color4,
    10
);
let rocks = [];
for (let i = 0; i < 10000; i++) {
    let size = Math.random();
    let rock = new Celestial_Object(
        randomInt(width+840)-420,
        randomInt(height+840)-420,
        6.9 * Math.pow(10, 12),
        size,
        Math.random()+3,
        null,
        null,
        size
    );
    if (
        //!rock.detectCollision(earth, 120) &&
        rock.detectCollision(earth, width*0.80)
    ) {
        rocks.push(rock);
    } else {
        i--;
    }
}
for (let rock of rocks) {
    rock.set90Angle(earth);
    rock.draw(ctx);
}

let frameRate = 1000 / 30;
requestAnimationFrame(loop);
// let count = 10000;
function loop() {
    ctx.clearRect(originX,originY,width-(originX*2),height-(originY*2));

    moon.applyForces(earth);
    moon.move();

    earth.draw(ctx);
    moon.draw(ctx);

    for (let rock of rocks) {
        rock.applyForces(earth);
        rock.applyForces(moon);
        rock.move();
        if (rock.detectCollision(earth)) {
            earth.resources += rock.resources;
            rocks.splice(rocks.indexOf(rock), 1);
            // console.log('earth resources : ' + earth.resources);
        }
        if (rock.detectCollision(moon)) {
            moon.resources += rock.resources;
            rocks.splice(rocks.indexOf(rock), 1);
            // console.log('moon resources : ' + moon.resources);
        }
        rock.draw(ctx);
        /*if (
            rock.posX > 0 && rock.posX < width &&
            rock.posY > 0 && rock.posY < height
        ) {
            rock.draw(ctx);
        }*/
    }

    /*if (rocks.length < count) {
        count = rocks.length;
        console.log(count);
    }*/

    setTimeout(function () {
        requestAnimationFrame(loop);
    }, frameRate);
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}
