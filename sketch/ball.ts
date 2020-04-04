import { drawable } from "./drawable.js";
import { p5 } from "../node_modules/p5/lib/p5.js";

export class Ball implements drawable {
    position: p5.Vector;
    velocity: p5.Vector;

    constructor() {
        this.position = p5.createVector(windowWidth / 2, windowHeight / 2);
        this.velocity = p5.createVector(1, 1);
    }

    draw(): void {
        p5.ellipseMode(CENTER);

        // ballX += xVelocity;
        this.position = this.position.add(this.velocity);
        // if (ballX > windowWidth || ballX < 0) {
        //     xVelocity *= -1;
        // }

        // ballY += yVelocity;
        // if (ballY > windowHeight || ballY < 0) {
        //     yVelocity *= -1;
        // }

        p5.ellipse(this.position.x, this.position.y, 80, 80);
    }
}
