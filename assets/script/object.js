console.log('object.js');
let airColor = 'rgb(112, 159, 176)';

class Celestial_Object {
    constructor(
        posX, posY, mass, radius,
        acceleration = null, direction = null,
        color = null, resources = null, atmosphere = null
    ) {
        this.posX = posX; // 1px = 1 000 kilometers
        this.posY = posY;
        this.mass = mass; // kilograms
        this.radius = radius; // 1/1000 kilometers
        this.inertia = acceleration; // m/s
        this.direction = direction; // degrees
        this.color = color;
        this.resources = resources;
        this.atmosphere = atmosphere;
    }
    draw(ctx, atmosphere) {
        if (this.color === null) {
            let grey = randomInt(191) + 64;
            this.color = 'rgb(' + grey + ', ' + grey + ', ' + grey + ')';
        }
        if (this.atmosphere != null) {
            ctx.fillStyle = airColor;
            ctx.beginPath();
            ctx.arc(
                this.posX, this.posY,
                this.radius + (this.atmosphere/1000),
                0, 2 * Math.PI
            );
            ctx.fill();
        }
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.posX, this.posY,
            this.radius, 0, 2 * Math.PI
        );
        ctx.fill();
    }
    move() {
        if (this.inertia === null) {
            return;
        }
        this.posX += this.inertia * Math.cos(this.direction * (Math.PI/180));
        this.posY += this.inertia * Math.sin(this.direction * (Math.PI/180));
    }
    calcDistance(posX, posY) {
        return Math.sqrt(
            Math.pow(posX - this.posX, 2) +
            Math.pow(posY - this.posY, 2)
        ) * 1000000; // magic number?
    }
    calcDirection(posX, posY) {
        let A = {'x' : this.posX, 'y' : this.posY};
        let B = {'x' : posX, 'y' : posY};
        if (A['x'] < B['x'] && A['y'] < B['y']) {
            let tanAngle = (B['y'] - A['y']) / (B['x'] - A['x']);
            return Math.atan(tanAngle) * (180/Math.PI);
        } else if (A['x'] > B['x'] && A['y'] < B['y']) {
            let tanAngle = (A['x'] - B['x']) / (B['y'] - A['y']);
            return (Math.atan(tanAngle) * (180/Math.PI)) + 90;
        } else if (A['x'] > B['x'] && A['y'] > B['y']) {
            let tanAngle = (A['y'] - B['y']) / (A['x'] - B['x']);
            return (Math.atan(tanAngle) * (180/Math.PI)) + 180;
        } else if (A['x'] < B['x'] && A['y'] > B['y']) {
            let tanAngle = (B['x'] - A['x']) / (A['y'] - B['y']);
            return (Math.atan(tanAngle) * (180/Math.PI)) + 270;
        } else {
            if (A['x'] < B['x'] && A['y'] === B['y']) {
                return 0;
            } else if (A['x'] === B['x'] && A['y'] < B['y']) {
                return 90;
            } else if (A['x'] > B['x'] && A['y'] === B['y']) {
                return 180;
            } else if (A['x'] === B['x'] && A['y'] > B['y']) {
                return 270;
            }
        }
    }
    calcFgrav(object) {
        let g = 6.67 * Math.pow(10, -11); // gravitational constant (G) : (N m2 kg−2)
        let r = object.calcDistance(this.posX, this.posY);
        return g * object.mass * this.mass / Math.pow(r, 2);
    }
    calcAcceleration(object) {
        return object.calcFgrav(this) / this.mass;
    }
    set90Angle(object) {
        this.direction = ((this.calcDirection(object.posX, object.posY)) - this.direction) - 90;
    }
    applyForces(object) {
        let g = this.calcAcceleration(object);
        let a = this.calcDirection(object.posX, object.posY);
        let B = {
            'x' : this.posX + this.inertia * Math.cos(this.direction * (Math.PI/180)),
            'y' : this.posY + this.inertia * Math.sin(this.direction * (Math.PI/180))
        };
        let C = {
            'x' : this.posX + g * Math.cos(a * (Math.PI/180)),
            'y' : this.posY + g * Math.sin(a * (Math.PI/180))
        };
        let D = {
            'x' : B['x'] + C['x'] - this.posX,
            'y' : B['y'] + C['y'] - this.posY
        }
        this.direction = this.calcDirection(D['x'],D['y']);
        this.inertia = this.calcDistance(D['x'],D['y']) / 1000000; // magic number?
    }
    detectCollision(object, expand = 0) {
        let distance = this.calcDistance(object.posX, object.posY) / 1000000; // magic number?
        return (
            distance <= (this.radius + object.radius) + expand
        )
    }
    displayForces(object, ctx) {
        let inertia = this.inertia * 100;
        let g = this.calcAcceleration(object) * 1000;
        let a = this.calcDirection(object.posX, object.posY);
        let A = {'x' : this.posX, 'y' : this.posY};
        let B = {
            'x' : A['x'] + inertia * Math.cos(this.direction * (Math.PI/180)),
            'y' : A['y'] + inertia * Math.sin(this.direction * (Math.PI/180))
        };
        let C = {
            'x' : this.posX + g * Math.cos(a * (Math.PI/180)),
            'y' : this.posY + g * Math.sin(a * (Math.PI/180))
        };
        let D = {
            'x' : B['x'] + C['x'] - A['x'],
            'y' : B['y'] + C['y'] - A['y']
        }

        ctx.fillStyle = 'rgb(0, 255, 0)';
        ctx.beginPath();
        ctx.arc(
            B['x'], B['y'],
            this.radius, 0, 2 * Math.PI
        );
        ctx.fill();
        ctx.fillStyle = 'rgb(255, 0, 0)';
        ctx.beginPath();
        ctx.arc(
            C['x'], C['y'],
            this.radius, 0, 2 * Math.PI
        );
        ctx.fill();
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.beginPath();
        ctx.arc(
            D['x'], D['y'],
            this.radius, 0, 2 * Math.PI
        );
        ctx.fill();

        ctx.strokeStyle = 'rgb(0, 255, 0)';
        ctx.beginPath();
        ctx.moveTo(this.posX, this.posY);
        ctx.lineTo(B['x'], B['y']);
        ctx.stroke();

        ctx.strokeStyle = 'rgb(255, 0, 0)';
        ctx.beginPath();
        ctx.moveTo(this.posX, this.posY);
        ctx.lineTo(C['x'], C['y']);
        ctx.stroke();

        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.beginPath();
        ctx.moveTo(this.posX, this.posY);
        ctx.lineTo(D['x'], D['y']);
        ctx.stroke();
    }
}

/*
if (canvas.getContext) {
    // code here
} else {
    console.log('Canvas is not supported');
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

console.log('----------------------------');
console.log('earth mass : ' + earth.mass + 'kilograms');
console.log('moon mass : ' + moon.mass + 'kilograms');
console.log('distance EarthToMoon : ' + earth.calcDistance(moon.posX, moon.posY) + ' meters');
console.log('Fgrav : ' + earth.calcFgrav(moon) + ' N');
console.log('acceleration EarthToMoon : ' + earth.calcAcceleration(moon) + ' m/S');
console.log('acceleration MoonToEarth : ' + moon.calcAcceleration(earth) + ' m/S');
console.log('direction MoonToEarth : ' + moon.calcDirection(earth.posX, earth.posY) + ' degrees');
console.log('----------------------------');

*/
