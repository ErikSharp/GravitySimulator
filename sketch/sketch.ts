import p5 from "p5";
import { Ball } from "./ball";
import { Particle } from "./particle";
import { Projectile } from "./projectile";
import { Ship } from "./ship";
import { SoundEffects } from "./sound";
import { BarnesHutTree } from "./barnes-hut";
import { LaserBeam } from "./laser";
import { PowerUp } from "./power-up";

const sketch = (p: p5) => {
    const bodies: Ball[] = [];
    const particles: Particle[] = [];
    const projectiles: Projectile[] = [];
    const powerUps: PowerUp[] = [];
    const lasers: LaserBeam[] = [];
    const sounds = new SoundEffects();
    let attractor: Ball;
    let ship: Ship;
    let launchStart: p5.Vector | undefined;
    let nextPowerUpFrame = 360;

    const spawnWave = () => {
        const largestOrbit = Math.max(110, Math.min(p.width, p.height) * 0.45);
        for (let index = 0; index < 20; index++) {
            const orbitRadius = p.random(85, largestOrbit);
            const angle = p.random(p.TWO_PI);
            const size = p.random(4, 12);
            const position = p5.Vector.fromAngle(angle).mult(orbitRadius).add(attractor.position);
            const tangentialVelocity = p5.Vector.fromAngle(angle + p.HALF_PI)
                .mult(Math.sqrt((0.2 * attractor.mass) / orbitRadius) * p.random(0.82, 1.18));
            const color: [number, number, number] = [
                p.floor(p.random(90, 256)),
                p.floor(p.random(90, 256)),
                p.floor(p.random(90, 256)),
            ];
            bodies.push(new Ball(p, position.x, position.y, tangentialVelocity, size * size, size, color));
        }
    };

    p.setup = () => {
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.style("display", "block");
        p.frameRate(60);

        attractor = new Ball(p, p.width / 2, p.height / 2, p.createVector(), 2000, 26, [255, 204, 77], true);
        spawnWave();
        ship = new Ship(p);
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.keyPressed = () => {
        sounds.unlock();
        if (p.keyCode === 32) {
            const shot = ship.shoot();
            if (shot) {
                projectiles.push(...shot.projectiles);
                if (shot.laser) lasers.push(shot.laser);
                if (shot.laser) sounds.laser();
                else sounds.fire();
            }
        }

        if ([32, p.LEFT_ARROW, p.RIGHT_ARROW, p.UP_ARROW].includes(p.keyCode)) {
            return false;
        }
    };

    p.mousePressed = () => {
        sounds.unlock();
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
        if (bodies.length === 0) {
            spawnWave();
        }
        if (p.frameCount >= nextPowerUpFrame) {
            powerUps.push(new PowerUp(p));
            nextPowerUpFrame = p.frameCount + p.floor(p.random(420, 720));
        }
        const gravityTree = new BarnesHutTree(bodies);
        bodies.forEach((body) => {
            body.resetGravity();
            body.addGravityFrom(attractor.position.x, attractor.position.y, attractor.mass);
            gravityTree.applyGravity(body);
        });
        bodies.forEach((body) => body.move());

        const shipUpdate = ship.update();
        if (shipUpdate.thrusting) {
            sounds.thrust();
        }
        if (shipUpdate.autoFire) {
            const shot = ship.shoot();
            if (shot) {
                projectiles.push(...shot.projectiles);
                if (shot.laser) lasers.push(shot.laser);
                if (shot.laser) sounds.laser();
                else sounds.fire();
            }
        }

        for (let index = powerUps.length - 1; index >= 0; index--) {
            const powerUp = powerUps[index];
            powerUp.update();
            if (powerUp.collidesWith(ship.position, ship.radius)) {
                ship.collect(powerUp.kind);
                sounds.powerUp();
                powerUps.splice(index, 1);
            }
        }

        for (let index = bodies.length - 1; index >= 0; index--) {
            const body = bodies[index];
            const projectileIndex = projectiles.findIndex(
                (shot) => p5.Vector.dist(shot.position, body.position) < body.radius + 3
            );
            const laserHit = lasers.some((laser) => laser.hits(body.position, body.radius));
            const shipCollision = ship.collidesWith(body.position, body.radius);
            if (projectileIndex >= 0 || laserHit || shipCollision) {
                if (projectileIndex >= 0) {
                    projectiles.splice(projectileIndex, 1);
                }
                for (let particleIndex = 0; particleIndex < 100; particleIndex++) {
                    particles.push(new Particle(p, body.position.copy()));
                }
                sounds.explosion();
                bodies.splice(index, 1);
                if (shipCollision) {
                    ship.respawn();
                }
            }
        }

        attractor.draw();
        bodies.forEach((body) => body.draw());
        powerUps.forEach((powerUp) => powerUp.draw());
        ship.draw();
        projectiles.splice(0, projectiles.length, ...projectiles.filter((shot) => shot.update()));
        projectiles.forEach((shot) => shot.draw());
        lasers.splice(0, lasers.length, ...lasers.filter((laser) => laser.update()));
        lasers.forEach((laser) => laser.draw());
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
        const activePowerUps = ship.activePowerUps();
        if (activePowerUps) {
            p.fill(190, 245, 255);
            p.text(`Power-ups: ${activePowerUps}`, 20, 76);
        }
    };
};

new p5(sketch);
