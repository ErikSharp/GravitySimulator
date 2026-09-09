import p5 from "p5";

export class LaserBeam {
    private lifetime = 8;
    private readonly end: p5.Vector;

    constructor(private p: p5, readonly start: p5.Vector, direction: p5.Vector) {
        this.end = p5.Vector.add(start, direction.setMag(Math.hypot(p.width, p.height) * 1.5));
    }

    update(): boolean {
        this.lifetime--;
        return this.lifetime > 0;
    }

    hits(position: p5.Vector, radius: number): boolean {
        const line = p5.Vector.sub(this.end, this.start);
        const toBody = p5.Vector.sub(position, this.start);
        const projection = this.p.constrain(toBody.dot(line) / line.magSq(), 0, 1);
        const closest = p5.Vector.add(this.start, line.mult(projection));
        return p5.Vector.dist(position, closest) < radius + 4;
    }

    draw(): void {
        const fade = this.lifetime / 8;
        this.p.blendMode(this.p.ADD);
        this.p.stroke(0, 255, 80, fade * 20);
        this.p.strokeWeight(20);
        this.p.line(this.start.x, this.start.y, this.end.x, this.end.y);
        this.p.stroke(0, 255, 80, fade * 65);
        this.p.strokeWeight(11);
        this.p.line(this.start.x, this.start.y, this.end.x, this.end.y);
        this.p.stroke(0, 255, 80, fade * 190);
        this.p.strokeWeight(5);
        this.p.line(this.start.x, this.start.y, this.end.x, this.end.y);
        this.p.stroke(255, 255, 255, fade * 255);
        this.p.strokeWeight(1.5);
        this.p.line(this.start.x, this.start.y, this.end.x, this.end.y);
        this.p.blendMode(this.p.BLEND);
    }
}
