import { drawable } from "./drawable";
import p5 from "p5";

export class Ball implements drawable {
    readonly position: p5.Vector;
    private trail: p5.Vector[] = [];

    constructor(
        private p: p5,
        x: number,
        y: number,
        readonly velocity: p5.Vector,
        readonly mass: number,
        readonly radius: number,
        private readonly color: [number, number, number],
        readonly fixed = false
    ) {
        this.position = p.createVector(x, y);
    }

    update(attractor: Ball): void {
        if (this.fixed) {
            return;
        }

        const direction = p5.Vector.sub(attractor.position, this.position);
        const distanceSquared = this.p.constrain(direction.magSq(), 400, 250000);
        const acceleration = (0.2 * attractor.mass) / distanceSquared;

        direction.setMag(acceleration);
        this.velocity.add(direction);
        this.position.add(this.velocity);

        this.trail.push(this.position.copy());
        if (this.trail.length > 90) {
            this.trail.shift();
        }
    }

    draw(): void {
        this.p.noFill();
        this.trail.forEach((point, index) => {
            const opacity = (index / this.trail.length) * 120;
            this.p.stroke(this.color[0], this.color[1], this.color[2], opacity);
            this.p.point(point.x, point.y);
        });

        this.p.noStroke();
        this.p.fill(this.color[0], this.color[1], this.color[2]);
        this.p.circle(this.position.x, this.position.y, this.radius * 2);
    }
}
