let angle = 0;
let squares = 20;
let colors: p5.Color[];
let colorIndex = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    colors = ColorHelper.getColorsArray(squares);
}

function draw() {
    background(10);

    translate(width / 2, height / 2);
    angle = angle + 0.01;
    rotate(angle);

    for (var i = 0; i < squares; i++) {
        strokeWeight(5);
        stroke(colors[colorIndex]);
        nextColor();

        noFill();
        beginShape();

        let points = Shapes.star(0, 0, 10 * i, 20 * i, 5);
        for (var x = 0; x < points.length; x++) {
            var v = points[x];
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
    }

    nextColor();
}

function nextColor() {
    ++colorIndex;
    colorIndex %= colors.length;
}
