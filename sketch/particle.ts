import p5 from "p5";

export class Particle {
    private life = 255;
    private readonly velocity: p5.Vector;
    private readonly size: number;
    private readonly color: [number, number, number];

    constructor(private p: p5, private position: p5.Vector) {
        this.velocity = p5.Vector.random2D().mult(p.random(1, 6));
        this.size = p.random(1, 4);
        this.color = [p.random(140, 256), p.random(80, 256), p.random(60, 256)];
    }

    update(): boolean {
        this.position.add(this.velocity);
        this.velocity.mult(0.96);
        this.life -= 5;
        return this.life > 0;
    }

    draw(): void {
        this.p.noStroke();
        this.p.fill(this.color[0], this.color[1], this.color[2], this.life);
        this.p.circle(this.position.x, this.position.y, this.size);
    }
}
