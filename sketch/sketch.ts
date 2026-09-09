import p5 from "p5";
import { Ball } from "./ball";

const sketch = (p: p5) => {
    const bodies: Ball[] = [];
    let attractor: Ball;
    let launchStart: p5.Vector | undefined;

    const addOrbitingBody = (
        radius: number,
        speed: number,
        mass: number,
        size: number,
        color: [number, number, number]
    ) => {
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        bodies.push(new Ball(p, centerX + radius, centerY, p.createVector(0, -speed), mass, size, color));
    };

    p.setup = () => {
        document.body.style.margin = "0";
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.frameRate(60);

        attractor = new Ball(p, p.width / 2, p.height / 2, p.createVector(), 2000, 26, [255, 204, 77], true);
        addOrbitingBody(105, 2, 10, 7, [87, 183, 255]);
        addOrbitingBody(185, 1.48, 14, 9, [255, 112, 112]);
        addOrbitingBody(270, 1.22, 7, 6, [161, 241, 157]);
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
        bodies.push(new Ball(p, launchStart.x, launchStart.y, launchVelocity, 8, 6, [255, 255, 255]));
        launchStart = undefined;
    };

    p.draw = () => {
        p.background(8, 12, 24);
        bodies.forEach((body) => body.update(attractor));
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
        p.text("Drag from the canvas to launch a new body", 20, 54);
    };
};

new p5(sketch);
