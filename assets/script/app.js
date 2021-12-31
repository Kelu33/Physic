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

let earth = new Celestial_Object(
    width/2, // centered position
    height/2,
    6.1 * Math.pow(10, 25), // kilograms
    34, // 1/100 kilometres
    null,
    null,
    color2
);
let moon = new Celestial_Object(
    width/2,
    (height/2)+384.4,  // 1/1000 kilometres
    7.3 * Math.pow(10, 23),
    17,
    3.2,
    180,
    color4
);
let rocks = [];
for (let i = 0; i < 1000; i++) {
    let rock = new Celestial_Object(
        randomInt(width),
        randomInt(height),
        6.9 * Math.pow(10, 12),
        Math.random()+2,
        Math.random()+3,
        null
    );
    if (
        !rock.detectCollision(earth, 100) &&
        rock.detectCollision(earth, 400)
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

for (let i = 0; i < 100; i++) {
    for (let rock of rocks) {
        rock.applyForces(earth);
        rock.applyForces(moon);
        rock.move();
        if (rock.detectCollision(earth) || rock.detectCollision(moon)) {
            rocks.splice(rocks.indexOf(rock), 1);
        }

        moon.applyForces(earth);
        moon.move();
    }
}

let frameRate = 1000 / 30;
requestAnimationFrame(loop);

function loop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    moon.applyForces(earth);
    moon.move();

    earth.draw(ctx);
    moon.draw(ctx);

    for (let rock of rocks) {
        rock.applyForces(earth);
        rock.applyForces(moon);
        rock.move();
        if (rock.detectCollision(earth) || rock.detectCollision(moon)) {
            rocks.splice(rocks.indexOf(rock), 1);
        }
        rock.draw(ctx);
    }

    setTimeout(function () {
        requestAnimationFrame(loop);
    }, frameRate);
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}
