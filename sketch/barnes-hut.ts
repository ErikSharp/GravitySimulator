import { Ball } from "./ball";

const MAX_DEPTH = 16;
const THETA = 0.55;

class Node {
    readonly children: Node[] = [];
    readonly bodies: Ball[] = [];
    mass = 0;
    centerX = 0;
    centerY = 0;

    constructor(
        readonly x: number,
        readonly y: number,
        readonly size: number,
        readonly depth = 0
    ) {}

    contains(ball: Ball): boolean {
        return ball.position.x >= this.x && ball.position.x <= this.x + this.size
            && ball.position.y >= this.y && ball.position.y <= this.y + this.size;
    }

    insert(ball: Ball): void {
        const previousMass = this.mass;
        this.mass += ball.mass;
        this.centerX = (this.centerX * previousMass + ball.position.x * ball.mass) / this.mass;
        this.centerY = (this.centerY * previousMass + ball.position.y * ball.mass) / this.mass;

        if (this.children.length === 0) {
            if (this.bodies.length === 0 || this.depth >= MAX_DEPTH) {
                this.bodies.push(ball);
                return;
            }
            this.subdivide();
            const existing = this.bodies.splice(0);
            existing.forEach((body) => this.childFor(body).insert(body));
        }
        this.childFor(ball).insert(ball);
    }

    private subdivide(): void {
        const half = this.size / 2;
        this.children.push(
            new Node(this.x, this.y, half, this.depth + 1),
            new Node(this.x + half, this.y, half, this.depth + 1),
            new Node(this.x, this.y + half, half, this.depth + 1),
            new Node(this.x + half, this.y + half, half, this.depth + 1)
        );
    }

    private childFor(ball: Ball): Node {
        const right = ball.position.x >= this.x + this.size / 2;
        const bottom = ball.position.y >= this.y + this.size / 2;
        return this.children[(bottom ? 2 : 0) + (right ? 1 : 0)];
    }
}

/** Approximates distant groups of bodies as a shared centre of mass. */
export class BarnesHutTree {
    private readonly root: Node | undefined;

    constructor(bodies: Ball[]) {
        if (bodies.length === 0) {
            return;
        }

        let minX = bodies[0].position.x;
        let maxX = minX;
        let minY = bodies[0].position.y;
        let maxY = minY;
        bodies.forEach((body) => {
            minX = Math.min(minX, body.position.x);
            maxX = Math.max(maxX, body.position.x);
            minY = Math.min(minY, body.position.y);
            maxY = Math.max(maxY, body.position.y);
        });
        const size = Math.max(maxX - minX, maxY - minY, 1) + 2;
        this.root = new Node(minX - 1, minY - 1, size);
        bodies.forEach((body) => this.root?.insert(body));
    }

    applyGravity(body: Ball): void {
        if (this.root) {
            this.visit(this.root, body);
        }
    }

    private visit(node: Node, body: Ball): void {
        if (node.mass === 0) {
            return;
        }
        if (node.children.length === 0) {
            node.bodies.forEach((other) => {
                if (other !== body) {
                    body.addGravityFrom(other.position.x, other.position.y, other.mass);
                }
            });
            return;
        }

        const dx = node.centerX - body.position.x;
        const dy = node.centerY - body.position.y;
        const distance = Math.hypot(dx, dy);
        if (!node.contains(body) && distance > 0 && node.size / distance < THETA) {
            body.addGravityFrom(node.centerX, node.centerY, node.mass);
            return;
        }
        node.children.forEach((child) => this.visit(child, body));
    }
}
