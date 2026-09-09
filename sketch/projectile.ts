import p5 from "p5";

export class Projectile {
    private lifetime = 90;

    constructor(private p: p5, readonly position: p5.Vector, private velocity: p5.Vector) {}

    update(): boolean {
        this.position.add(this.velocity);
        this.position.x = (this.position.x + this.p.width) % this.p.width;
        this.position.y = (this.position.y + this.p.height) % this.p.height;
        this.lifetime--;
        return this.lifetime > 0;
    }

    draw(): void {
        this.p.noStroke();
        this.p.fill(255, 245, 180);
        this.p.circle(this.position.x, this.position.y, 4);
    }
}
