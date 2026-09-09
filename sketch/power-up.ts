import p5 from "p5";

export type PowerUpKind = "spread" | "auto" | "laser";

const labels: Record<PowerUpKind, string> = { spread: "S", auto: "M", laser: "L" };

export class PowerUp {
    readonly position: p5.Vector;
    readonly kind: PowerUpKind;
    private readonly velocity: p5.Vector;
    private readonly sides: number;
    private readonly angle: number;
    private readonly spin: number;
    private readonly hue: number;

    constructor(private p: p5) {
        this.position = p.createVector(p.random(p.width), p.random(p.height));
        this.velocity = p5.Vector.random2D().mult(p.random(0.25, 0.7));
        this.kind = p.random(["spread", "auto", "laser"] as PowerUpKind[]);
        this.sides = p.floor(p.random(4, 8));
        this.angle = p.random(p.TWO_PI);
        this.spin = p.random(-0.025, 0.025);
        this.hue = p.random(360);
    }

    update(): void {
        this.position.add(this.velocity);
        this.position.x = (this.position.x + this.p.width) % this.p.width;
        this.position.y = (this.position.y + this.p.height) % this.p.height;
    }

    collidesWith(position: p5.Vector, radius: number): boolean {
        return p5.Vector.dist(this.position, position) < radius + 15;
    }

    draw(): void {
        const pulse = 11 + Math.sin(this.p.frameCount * 0.08 + this.angle) * 3;
        const color = this.p.color(`hsl(${(this.hue + this.p.frameCount * 2) % 360} 95% 65%)`);
        this.p.push();
        this.p.translate(this.position.x, this.position.y);
        this.p.rotate(this.angle + this.p.frameCount * this.spin);
        this.p.noFill();
        this.p.stroke(color);
        this.p.strokeWeight(2);
        this.p.beginShape();
        for (let index = 0; index < this.sides; index++) {
            const pointAngle = (index / this.sides) * this.p.TWO_PI;
            this.p.vertex(Math.cos(pointAngle) * pulse, Math.sin(pointAngle) * pulse);
        }
        this.p.endShape(this.p.CLOSE);
        this.p.noStroke();
        this.p.fill(255);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.textSize(14);
        this.p.text(labels[this.kind], 0, 1);
        this.p.pop();
    }
}
