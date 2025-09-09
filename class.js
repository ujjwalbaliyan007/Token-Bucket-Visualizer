let tokens = [];
let bucketSize = 5;
let tokenRate = 5.0; // tokens/sec
let lastTokenTime = 0;
const conveyorY = 550;
const conveyorSpeed = -2;
let conveyorMarkerOffset = 0;

function setup() {
  createCanvas(400, 600);
  textAlign(CENTER);
  textSize(16);
}

function draw() {
  drawBackground();

  // Add tokens at fixed rate
  let currentTime = millis() / 1000;
  if (currentTime - lastTokenTime >= 1 / tokenRate && tokens.length < bucketSize) {
    addToken();
    lastTokenTime = currentTime;
  }

  drawConveyor();
  drawBucket();
  drawTokens();
  drawLabel();
}

function drawBackground() {
  // Gradient background
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(230, 240, 255), color(180, 210, 240), inter);
    stroke(c);
    line(0, y, width, y);
  }

  // Subtle grid
  stroke(220, 220, 230);
  strokeWeight(1);
  for (let x = 0; x < width; x += 40) line(x, 0, x, height);
  for (let y = 0; y < height; y += 40) line(0, y, width, y);
}

function addToken() {
  let r = random(50, 255);
  let g = random(50, 255);
  let b = random(50, 255);
  tokens.push({
    color: [r, g, b],
    ejecting: false,
    onConveyor: false,
    x: 0, y: 0,
    vx: 0, vy: 0
  });
}

function drawConveyor() {
  stroke(0);
  strokeWeight(2);
  fill(100);
  rect(0, conveyorY, width, 20);

  conveyorMarkerOffset = (conveyorMarkerOffset + conveyorSpeed) % 40;
  for (let x = conveyorMarkerOffset; x < width; x += 40) {
    fill(255, 255, 0);
    noStroke();
    circle(x, conveyorY + 10, 8);
  }
}

function drawBucket() {
  stroke(0);
  strokeWeight(4);
  noFill();
  rect(150, 100, 100, 400, 20);
}

function drawTokens() {
  let tokenRadius = 20;
  let tokenSpacing = 50;

  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];

    if (!t.ejecting && !t.onConveyor) {
      // Position inside bucket
      t.x = 200;
      t.y = 450 - i * tokenSpacing;
    } else if (t.ejecting && !t.onConveyor) {
      // Flying out
      t.x += t.vx;
      t.y += t.vy;
      t.vy += 0.5;
      if (t.y >= conveyorY - tokenRadius) {
        t.y = conveyorY - tokenRadius;
        t.onConveyor = true;
        t.vx = conveyorSpeed;
        t.vy = 0;
      }
    } else if (t.onConveyor) {
      t.x += t.vx;
    }

    fill(t.color);
    noStroke();
    circle(t.x, t.y, tokenRadius);
  }

  // Remove tokens that are off screen
  tokens = tokens.filter(
    t => !(t.onConveyor && t.x < -tokenRadius)
  );
}

function drawLabel() {
  fill(0);
  noStroke();
  text(`Tokens: ${tokens.length} / ${bucketSize}`, 200, 50);
}

function updateSettings() {
  let rateInput = document.getElementById("rate").value;
  let capacityInput = document.getElementById("capacity").value;

  tokenRate = max(1, parseInt(rateInput));
  bucketSize = max(1, parseInt(capacityInput));
}

function hitToken() {
  // Find the first token still inside the bucket
  let candidate = tokens.find(t => !t.ejecting && !t.onConveyor);

  if (candidate) {
    candidate.ejecting = true;
    candidate.vx = 0;
    candidate.vy = -8;
  }
}
