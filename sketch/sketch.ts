import p5 from "p5";
// import { Ball } from "./ball.js";
// import { drawable } from "./drawable.js";

function sketch(p: p5) {
    p.setup = function() {
        p.createCanvas(p.windowWidth, p.windowHeight);
        // drawables.push(new Ball());

        // ballX = windowWidth / 2;
        // ballY = windowHeight / 2;
    };

    p.draw = function() {
        p.background(10);
        // drawable1s.forEach(d => d.draw());

        // ellipseMode(CENTER);
    }.bind(p);
}

let foo = new p5(sketch);
