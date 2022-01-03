console.log("app.js");

let color0 = 'rgb(0, 0, 0)';
let color1 = 'rgb(65, 60, 105)';
let color2 = 'rgb(74, 71, 163)';
let color3 = 'rgb(112, 159, 176)';
let color4 = 'rgb(167, 197, 235)';

const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext('2d');

let centerX = canvas.width/2;
let centerY = canvas.height/2;

let scaleFactor = 1.1;
let currentZoom = 0;
let factor = 0;
let delta = 0;
let tracking;
let offsetX = 0;
let offsetY = 0;

function zoom(clicks) {
    ctx.translate(centerX, centerY);
    factor = Math.pow(scaleFactor, clicks);
    ctx.scale(factor,factor);
    ctx.translate(-centerX, -centerY);
}
function trackingView(object) {
    tracking = true;
    ctx.translate(- object.posX + centerX + offsetX, - object.posY + centerY + offsetY);
    centerX += (object.posX - centerX - offsetX);
    centerY += (object.posY - centerY - offsetY);
}
canvas.addEventListener('mousewheel', function (e) {
    delta = -e.deltaY ? -e.deltaY/40 : e.detail ? -e.detail : 0;
    if (delta) {
        if (delta < 0 && currentZoom >= -5) {
            zoom(delta);
            currentZoom--;
        }
        if (delta > 0  && currentZoom <= 50) {
            zoom(delta);
            currentZoom++;
        }
    }
    return e.preventDefault() && false;
});
let lastX, lastY;
let drag;
let firstClick;
canvas.addEventListener('mousedown', function (e) {
    drag = true;
    lastX = e.clientX;
    lastY = e.clientY;

    if (firstClick) {
        offsetX = 0;
        offsetY = 0;
        if (!tracking) {
            trackingView(moon); // TODO fix unZoom
        } else {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            currentZoom = 0;
            centerX = canvas.width/2;
            centerY = canvas.height/2;
            tracking = false;
        }
    }
    firstClick = true;
    setTimeout(function () {
        firstClick = false;
    },350);
});

canvas.addEventListener('mousemove', function (e) {
    if (drag) {
        let newX = e.clientX - lastX;
        let newY = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        if (currentZoom > 0) {
            if (factor < 1) factor = 1 / factor;
            newY /= (Math.pow(factor, currentZoom));
            newX /= (Math.pow(factor, currentZoom));
        }
        if (currentZoom < 0) {
            if (factor > 1) factor = 1 / factor;
            newY /= (Math.pow(factor, -currentZoom));
            newX /= (Math.pow(factor, -currentZoom));
        }

        ctx.translate(newX, newY);

        offsetX += newX;
        offsetY += newY;

        centerX -= newX;
        centerY -= newY;
    }
});
canvas.addEventListener('mouseup', function () {
    if (drag) drag = false;
});

let earth = new Celestial_Object(
    centerX,
    centerY,
    6.1 * Math.pow(10, 25), // kilograms
    24, // 1/100 kilometres
    null,
    null,
    color2,
    100,
    100,
);
let moon = new Celestial_Object(
    centerX,
    centerY-384.4,  // 1/1000 kilometres
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
        randomInt(canvas.width+840)-420,
        randomInt(canvas.height+840)-420,
        6.9 * Math.pow(10, 12),
        size,
        Math.random()+2.5,
        null,
        null,
        size
    );
    if (
        //!rock.detectCollision(earth, 120) &&
        rock.detectCollision(earth, centerX)
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

let frameRate = 1000 / 60;
requestAnimationFrame(loop);

function loop() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.restore();

    moon.applyForces(earth);
    moon.move();

    if (tracking) trackingView(moon);

    earth.draw(ctx);
    moon.draw(ctx);

    for (let rock of rocks) {
        rock.applyForces(earth);
        rock.applyForces(moon);
        rock.move();
        if (rock.detectCollision(earth)) {
            earth.resources += rock.resources;
            rocks.splice(rocks.indexOf(rock), 1);
        }
        if (rock.detectCollision(moon)) {
            moon.resources += rock.resources;
            rocks.splice(rocks.indexOf(rock), 1);
        }
        if (rock.detectCollision(earth, canvas.height * 2)) {
            rock.draw(ctx);
        }
    }

    setTimeout(function () {
        requestAnimationFrame(loop);
    }, frameRate);
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}
