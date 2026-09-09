import p5 from "p5";
import { Projectile } from "./projectile";

export class Ship {
    readonly radius = 12;
    readonly position: p5.Vector;
    private velocity: p5.Vector;
    private heading = 0;
    private fireCooldown = 0;
    private invulnerability = 90;

    constructor(private p: p5) {
        this.position = p.createVector();
        this.velocity = p.createVector();
        this.respawn();
    }

    update(): void {
        if (this.p.keyIsDown(this.p.LEFT_ARROW)) {
            this.heading -= 0.08;
        }
        if (this.p.keyIsDown(this.p.RIGHT_ARROW)) {
            this.heading += 0.08;
        }
        if (this.p.keyIsDown(this.p.UP_ARROW)) {
            this.velocity.add(p5.Vector.fromAngle(this.heading - this.p.HALF_PI).mult(0.12));
        }

        this.position.add(this.velocity);
        this.velocity.mult(0.995);
        this.position.x = (this.position.x + this.p.width) % this.p.width;
        this.position.y = (this.position.y + this.p.height) % this.p.height;
        this.fireCooldown = Math.max(0, this.fireCooldown - 1);
        this.invulnerability = Math.max(0, this.invulnerability - 1);
    }

    shoot(): Projectile | undefined {
        if (this.fireCooldown === 0) {
            this.fireCooldown = 10;
            const direction = p5.Vector.fromAngle(this.heading - this.p.HALF_PI);
            const bulletPosition = p5.Vector.add(this.position, direction.copy().mult(this.radius + 4));
            const bulletVelocity = p5.Vector.add(this.velocity, direction.mult(8));
            return new Projectile(this.p, bulletPosition, bulletVelocity);
        }
    }

    collidesWith(position: p5.Vector, radius: number): boolean {
        return this.invulnerability === 0 && p5.Vector.dist(this.position, position) < this.radius + radius;
    }

    respawn(): void {
        this.position.set(this.p.width / 2, this.p.height / 2 + 330);
        this.velocity.set(0, 0);
        this.heading = 0;
        this.invulnerability = 120;
    }

    draw(): void {
        const flashing = this.invulnerability > 0 && this.p.frameCount % 10 < 5;
        this.p.push();
        this.p.translate(this.position.x, this.position.y);
        this.p.rotate(this.heading);
        this.p.noFill();
        this.p.stroke(flashing ? 150 : 240, 240, 255);
        this.p.strokeWeight(2);
        this.p.triangle(0, -this.radius, -this.radius * 0.7, this.radius, this.radius * 0.7, this.radius);
        this.p.pop();
    }
}
