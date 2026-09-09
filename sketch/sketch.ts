import p5 from "p5";
import { Ball } from "./ball";

const sketch = (p: p5) => {
    const bodies: Ball[] = [];
    let attractor: Ball;
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
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.frameRate(60);

        attractor = new Ball(p, p.width / 2, p.height / 2, p.createVector(), 2000, 26, [255, 204, 77], true);
        addOrbitingBody(105, 2, 7, [87, 183, 255]);
        addOrbitingBody(185, 1.48, 9, [255, 112, 112]);
        addOrbitingBody(270, 1.22, 6, [161, 241, 157]);
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
        attractor.draw();
        bodies.forEach((body) => body.draw());

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
        p.text("Drag to launch a random body — size shows mass", 20, 54);
    };
};

new p5(sketch);
