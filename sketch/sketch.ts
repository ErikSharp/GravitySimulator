import p5 from "p5";
import { Ball } from "./ball";
import { Particle } from "./particle";
import { Projectile } from "./projectile";
import { Ship } from "./ship";

const sketch = (p: p5) => {
    const bodies: Ball[] = [];
    const particles: Particle[] = [];
    const projectiles: Projectile[] = [];
    let attractor: Ball;
    let ship: Ship;
    let launchStart: p5.Vector | undefined;

    const addOrbitingBody = (
        radius: number,
        speed: number,
        size: number,
        color: [number, number, number]
    ) => {
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        bodies.push(new Ball(p, centerX + radius, centerY, p.createVector(0, -speed), size * size, size, color));
    };

    p.setup = () => {
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.style("display", "block");
        p.frameRate(60);

        attractor = new Ball(p, p.width / 2, p.height / 2, p.createVector(), 2000, 26, [255, 204, 77], true);
        addOrbitingBody(105, 2, 7, [87, 183, 255]);
        addOrbitingBody(185, 1.48, 9, [255, 112, 112]);
        addOrbitingBody(270, 1.22, 6, [161, 241, 157]);
        ship = new Ship(p);
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.keyPressed = () => {
        if (p.keyCode === 32) {
            const projectile = ship.shoot();
            if (projectile) {
                projectiles.push(projectile);
            }
        }

        if ([32, p.LEFT_ARROW, p.RIGHT_ARROW, p.UP_ARROW].includes(p.keyCode)) {
            return false;
        }
    };

    p.mousePressed = () => {
        launchStart = p.createVector(p.mouseX, p.mouseY);
    };

    p.mouseReleased = () => {
        if (!launchStart) {
            return;
        }

        const launchVelocity = p5.Vector.sub(launchStart, p.createVector(p.mouseX, p.mouseY));
        launchVelocity.mult(0.04);
        const radius = p.random(4, 16);
        const color: [number, number, number] = [
            p.floor(p.random(90, 256)),
            p.floor(p.random(90, 256)),
            p.floor(p.random(90, 256)),
        ];
        bodies.push(new Ball(p, launchStart.x, launchStart.y, launchVelocity, radius * radius, radius, color));
        launchStart = undefined;
    };

    p.draw = () => {
        p.background(8, 12, 24);
        const allBodies = [attractor, ...bodies];
        bodies.forEach((body) => body.applyGravity(allBodies));
        bodies.forEach((body) => body.move());

        ship.update();

        for (let index = bodies.length - 1; index >= 0; index--) {
            const body = bodies[index];
            const projectileIndex = projectiles.findIndex(
                (shot) => p5.Vector.dist(shot.position, body.position) < body.radius + 3
            );
            const shipCollision = ship.collidesWith(body.position, body.radius);
            if (projectileIndex >= 0 || shipCollision) {
                if (projectileIndex >= 0) {
                    projectiles.splice(projectileIndex, 1);
                }
                for (let particleIndex = 0; particleIndex < 100; particleIndex++) {
                    particles.push(new Particle(p, body.position.copy()));
                }
                bodies.splice(index, 1);
                if (shipCollision) {
                    ship.respawn();
                }
            }
        }

        attractor.draw();
        bodies.forEach((body) => body.draw());
        ship.draw();
        projectiles.splice(0, projectiles.length, ...projectiles.filter((shot) => shot.update()));
        projectiles.forEach((shot) => shot.draw());
        particles.splice(0, particles.length, ...particles.filter((particle) => particle.update()));
        particles.forEach((particle) => particle.draw());

        if (launchStart) {
            p.stroke(255, 255, 255, 180);
            p.line(launchStart.x, launchStart.y, p.mouseX, p.mouseY);
        }

        p.noStroke();
        p.fill(235);
        p.textSize(16);
        p.text("Gravity Simulator", 20, 32);
        p.textSize(13);
        p.fill(180);
        p.text("Arrows: steer · Space: fire · Drag: launch a random body", 20, 54);
    };
};

new p5(sketch);
