import { drawable } from "./drawable.js";
import p5 from "p5";

export class Ball implements drawable {
    position: p5.Vector;
    velocity: p5.Vector;

    constructor(private p: p5) {
        this.position = p.createVector(p.windowWidth / 2, p.windowHeight / 2);
        this.velocity = p.createVector(1, 1);
    }

    draw(): void {
        this.p.ellipseMode(this.p.CENTER);

        // ballX += xVelocity;
        this.position = this.position.add(this.velocity);
        // if (ballX > windowWidth || ballX < 0) {
        //     xVelocity *= -1;
        // }

        // ballY += yVelocity;
        // if (ballY > windowHeight || ballY < 0) {
        //     yVelocity *= -1;
        // }

        this.p.ellipse(this.position.x, this.position.y, 80, 80);
    }
}
