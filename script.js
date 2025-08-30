// Flappy Bird Game - Production Ready Version
// A simple HTML5 Canvas game built with JavaScript

// Get canvas element and context
const canvas = document.getElementById("gameCanvas");
if (!canvas) {
  throw new Error("Canvas element not found. Make sure the HTML has <canvas id='gameCanvas'></canvas>");
}
const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Canvas context not supported. Please use a modern browser.");
}

// Load bird image with error handling
const birdImg = new Image();
birdImg.src = "flappy-bird.png";
birdImg.onerror = function() {
  console.warn("Bird image failed to load. Using fallback.");
};

// Game constants
const GRAVITY = 0.6;
const LIFT = -8;
const PIPE_GAP = 150;
const PIPE_WIDTH = 50;
const PIPE_SPEED = 2;
const PIPE_FREQUENCY = 90; // Frames between new pipes

// Bird object
let bird = {
  x: 80,
  y: canvas.height / 2,
  width: 34,
  height: 24,
  velocity: 0,
  gravity: GRAVITY,
  lift: LIFT,
};

// Game state variables
let pipes = [];
let frameCount = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem('flappyBirdHighScore')) || 0;
let gameRunning = true;
let gameStarted = false;

// Draw the game background
function drawBackground() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw the start screen
function drawStartScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Flappy Bird", canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = "20px Arial";
  ctx.fillText("Press Space or Tap to Start", canvas.width / 2, canvas.height / 2);
  ctx.fillText("Avoid the pipes and score points!", canvas.width / 2, canvas.height / 2 + 30);
  ctx.textAlign = "start";
}

// Draw the bird
function drawBird() {
  // Try to draw image, fallback to yellow rectangle
  if (birdImg.complete && birdImg.naturalHeight !== 0) {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  } else {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
  }
}

// Update bird position
function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Prevent bird from going off-screen
  if (bird.y + bird.height > canvas.height) {
    bird.y = canvas.height - bird.height;
    bird.velocity = 0;
  }
  if (bird.y < 0) {
    bird.y = 0;
    bird.velocity = 0;
  }
}

// Draw all pipes
function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach((pipe) => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
    // Bottom pipe
    ctx.fillRect(pipe.x, pipe.top + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.top - PIPE_GAP);
  });
}

// Update pipe positions and generate new pipes
function updatePipes() {
  frameCount++;
  if (frameCount % PIPE_FREQUENCY === 0) {
    let top = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
    pipes.push({ x: canvas.width, top: top, passed: false });
  }
  pipes.forEach((pipe) => {
    pipe.x -= PIPE_SPEED;
    // Scoring: when bird passes the pipe
    if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
      score++;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyBirdHighScore', highScore);
      }
      pipe.passed = true;
    }
  });
  // Remove off-screen pipes
  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0);
}

// Check for collisions between bird and pipes or ground
function checkCollision() {
  for (let pipe of pipes) {
    if (bird.x < pipe.x + PIPE_WIDTH && bird.x + bird.width > pipe.x) {
      if (bird.y < pipe.top || bird.y + bird.height > pipe.top + PIPE_GAP) {
        gameRunning = false;
      }
    }
  }
  // Check ground collision
  if (bird.y + bird.height >= canvas.height) {
    gameRunning = false;
  }
}

// Draw current score and high score
function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("High Score: " + highScore, 10, 40);
}

// Display game over screen
function showGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "32px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText("High Score: " + highScore, canvas.width / 2, canvas.height / 2 + 60);
  ctx.font = "24px Arial";
  ctx.fillText("Press Space to Restart", canvas.width / 2, canvas.height / 2 + 90);
  ctx.textAlign = "start";
}

// Single main RAF loop (runs continuously). Use state flags to control behaviour.
let rafId = null;

function resetGame() {
  pipes = [];
  frameCount = 0;
  score = 0;
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  gameRunning = true;
}

function loop() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    drawStartScreen();
  } else if (gameRunning) {
    drawBackground();
    updateBird();
    updatePipes();
    drawPipes();
    drawBird();
    drawScore();
    checkCollision();
  } else {
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();
    showGameOver();
  }

  rafId = requestAnimationFrame(loop);
}

// Keyboard controls
document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    e.preventDefault(); // Prevent page scroll
    if (!gameStarted) {
      gameStarted = true;
      resetGame();
      if (rafId === null) loop();
    } else if (!gameRunning) {
      // Restart
      resetGame();
      gameStarted = true;
      if (rafId === null) loop();
    } else {
      // Flap: set velocity for a consistent impulse
      bird.velocity = bird.lift;
    }
  }
});

// Touch controls for mobile
canvas.addEventListener("touchstart", function (e) {
  e.preventDefault();
  if (!gameStarted) {
    gameStarted = true;
    resetGame();
    if (rafId === null) loop();
  } else if (!gameRunning) {
    resetGame();
    gameStarted = true;
    if (rafId === null) loop();
  } else {
    bird.velocity = bird.lift;
  }
});

// Start the RAF loop (single continuous loop)
if (rafId === null) loop();
