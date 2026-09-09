import p5 from "p5";
import { Projectile } from "./projectile";
import { LaserBeam } from "./laser";
import { PowerUpKind } from "./power-up";

export interface FireResult {
    projectiles: Projectile[];
    laser?: LaserBeam;
}

export class Ship {
    readonly radius = 12;
    readonly position: p5.Vector;
    private velocity: p5.Vector;
    private heading = 0;
    private fireCooldown = 0;
    private invulnerability = 90;
    private spreadFrames = 0;
    private autoFrames = 0;
    private laserFrames = 0;

    constructor(private p: p5) {
        this.position = p.createVector();
        this.velocity = p.createVector();
        this.respawn();
    }

    update(): { thrusting: boolean; autoFire: boolean } {
        let thrusting = false;
        if (this.p.keyIsDown(this.p.LEFT_ARROW)) {
            this.heading -= 0.08;
        }
        if (this.p.keyIsDown(this.p.RIGHT_ARROW)) {
            this.heading += 0.08;
        }
        if (this.p.keyIsDown(this.p.UP_ARROW)) {
            this.velocity.add(p5.Vector.fromAngle(this.heading - this.p.HALF_PI).mult(0.12));
            thrusting = true;
        }

        this.position.add(this.velocity);
        this.velocity.mult(0.995);
        this.position.x = (this.position.x + this.p.width) % this.p.width;
        this.position.y = (this.position.y + this.p.height) % this.p.height;
        this.fireCooldown = Math.max(0, this.fireCooldown - 1);
        this.invulnerability = Math.max(0, this.invulnerability - 1);
        this.spreadFrames = Math.max(0, this.spreadFrames - 1);
        this.autoFrames = Math.max(0, this.autoFrames - 1);
        this.laserFrames = Math.max(0, this.laserFrames - 1);
        return { thrusting, autoFire: this.autoFrames > 0 && this.fireCooldown === 0 };
    }

    collect(kind: PowerUpKind): void {
        if (kind === "spread") this.spreadFrames = 720;
        if (kind === "auto") this.autoFrames = 720;
        if (kind === "laser") this.laserFrames = 720;
    }

    activePowerUps(): string {
        const active: string[] = [];
        if (this.spreadFrames > 0) active.push("S");
        if (this.autoFrames > 0) active.push("M");
        if (this.laserFrames > 0) active.push("L");
        return active.join(" ");
    }

    shoot(): FireResult | undefined {
        if (this.fireCooldown === 0) {
            this.fireCooldown = 10;
            const direction = p5.Vector.fromAngle(this.heading - this.p.HALF_PI);
            if (this.laserFrames > 0) {
                const laserStart = p5.Vector.add(this.position, direction.copy().mult(this.radius + 1));
                return { projectiles: [], laser: new LaserBeam(this.p, laserStart, direction) };
            }
            const bulletPosition = p5.Vector.add(this.position, direction.copy().mult(this.radius + 4));
            const angles = this.spreadFrames > 0 ? [-0.24, 0, 0.24] : [0];
            return {
                projectiles: angles.map((angle) => {
                    const velocity = p5.Vector.add(this.velocity, direction.copy().rotate(angle).mult(8));
                    return new Projectile(this.p, bulletPosition.copy(), velocity);
                }),
            };
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
        this.spreadFrames = 0;
        this.autoFrames = 0;
        this.laserFrames = 0;
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
