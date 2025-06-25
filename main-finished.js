// set up canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// Pause functionality
let paused = false;
const pauseBtn = document.getElementById('pauseBtn');
pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  if (!paused) loop();
});

// Background color state
let bgColor = { r: 34, g: 34, b: 34 };
function setBgColor(r, g, b) {
  bgColor = { r, g, b };
}
function getBgColor() {
  return `rgb(${bgColor.r},${bgColor.g},${bgColor.b})`;
}
function uniqueBounceColor() {
  // Cycle through HSL for unique effect
  if (!uniqueBounceColor.hue) uniqueBounceColor.hue = 0;
  uniqueBounceColor.hue = (uniqueBounceColor.hue + 37) % 360;
  const h = uniqueBounceColor.hue;
  // Convert HSL to RGB
  const a = (1 - Math.abs(2 * 0.15 - 1));
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return 34 + Math.round(221 * Math.max(0, Math.min(k - 3, 9 - k, 1)) * a);
  };
  setBgColor(f(0), f(8), f(4));
}

// function to generate random number
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function to generate random RGB color value
function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

// Shape class
class Shape {
  constructor(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }
}

// Ball class
class Ball extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY);
    this.color = color;
    this.size = size;
    this.exists = true;
  }

  draw() {
    if (!this.exists) return;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    if (!this.exists) return;
    let bounced = false;
    if (this.x + this.size >= width) {
      this.velX = -Math.abs(this.velX);
      bounced = true;
    }
    if (this.x - this.size <= 0) {
      this.velX = Math.abs(this.velX);
      bounced = true;
    }
    if (this.y + this.size >= height) {
      this.velY = -Math.abs(this.velY);
      bounced = true;
    }
    if (this.y - this.size <= 0) {
      this.velY = Math.abs(this.velY);
      bounced = true;
    }
    if (bounced) uniqueBounceColor();
    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    for (const ball of balls) {
      if (!(this === ball) && ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.size + ball.size) {
          ball.color = this.color = randomRGB();
        }
      }
    }
  }
}

// EvilCircle class
class EvilCircle extends Shape {
  constructor(x, y) {
    super(x, y, 20, 20);
    this.color = "#fff";
    this.size = 10;
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "a":
          this.x -= this.velX;
          break;
        case "d":
          this.x += this.velX;
          break;
        case "w":
          this.y -= this.velY;
          break;
        case "s":
          this.y += this.velY;
          break;
      }
    });
  }

  draw() {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  }

  checkBounds() {
    if (this.x + this.size >= width) this.x = width - this.size;
    if (this.x - this.size <= 0) this.x = this.size;
    if (this.y + this.size >= height) this.y = height - this.size;
    if (this.y - this.size <= 0) this.y = this.size;
  }

  collisionDetect() {
    for (const ball of balls) {
      if (ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.size + ball.size) {
          ball.exists = false;
        }
      }
    }
  }
}

// Ball array
const balls = [];
const ballCount = 25;
for (let i = 0; i < ballCount; i++) {
  const size = random(10, 20);
  const ball = new Ball(
    random(size, width - size),
    random(size, height - size),
    random(-7, 7) || 1,
    random(-7, 7) || 1,
    randomRGB(),
    size
  );
  balls.push(ball);
}

// EvilCircle instance
const evil = new EvilCircle(
  random(20, width - 20),
  random(20, height - 20)
);

// Score counter
let para = document.querySelector("p");
if (!para) {
  para = document.createElement("p");
  document.body.appendChild(para);
}
para.style.position = "absolute";
para.style.margin = "0";
para.style.top = "35px";
para.style.right = "5px";
para.style.color = "#aaa";
para.style.fontSize = "1.2rem";

// Animation loop
function loop() {
  if (paused) return;
  ctx.fillStyle = getBgColor();
  ctx.fillRect(0, 0, width, height);

  let count = 0;
  for (const ball of balls) {
    if (ball.exists) {
      ball.draw();
      ball.update();
      ball.collisionDetect();
      count++;
    }
  }

  evil.draw();
  evil.checkBounds();
  evil.collisionDetect();

  para.textContent = "Ball count: " + count;

  requestAnimationFrame(loop);
}

loop();