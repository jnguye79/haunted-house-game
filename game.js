const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let scene = -1;
let transitioning = false;
let transitionProgress = 0; // 0 → 1
let transitionType = null;

const dialogues = [
  "They say no one should enter the house down the street at night...",
  "But a group of curious kindergarteners dared to sneak inside!",
  "Suddenly, the house lights flicker on...\nA grand staircase with four doors appears."
];

const sceneImages = ["scene1.png", "scene2.png", "scene3.png"].map(src => {
  const img = new Image();
  img.src = `assets/images/${src}`;
  return img;
});

// draw scene normally
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (scene >= 0 && scene < sceneImages.length) {
    ctx.drawImage(sceneImages[scene], 0, 0, canvas.width, canvas.height);
  }

  // dialogue box
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  ctx.fillStyle = "#fff";
  ctx.font = "12px 'Press Start 2P'";
  wrapText(dialogues[scene], 20, canvas.height - 55, canvas.width - 40, 14);
}

// helper to wrap text
function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// animate transitions
function animateTransition(callback) {
  transitioning = true;
  transitionProgress = 0;

  function step() {
    transitionProgress += 0.02; // speed
    if (transitionProgress >= 1) {
      transitionProgress = 1;
    }

    // draw current or next scene depending on type
    if (transitionType === "fadeIn") {
      drawScene();
      ctx.fillStyle = `rgba(0,0,0,${1 - transitionProgress})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (transitionType === "fadeOut") {
      drawScene();
      ctx.fillStyle = `rgba(0,0,0,${transitionProgress})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (transitionType === "pageFlip") {
      // draw old scene on left shrinking
      const oldWidth = canvas.width * (1 - transitionProgress);
      ctx.drawImage(sceneImages[scene - 1], 0, 0, oldWidth, canvas.height);

      // draw new scene revealed from right
      const newWidth = canvas.width * transitionProgress;
      ctx.drawImage(sceneImages[scene], canvas.width - newWidth, 0, newWidth, canvas.height);

      // dialogue box for new scene after halfway
      if (transitionProgress > 0.5) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
        ctx.fillStyle = "#fff";
        ctx.font = "12px 'Press Start 2P'";
        wrapText(dialogues[scene], 20, canvas.height - 55, canvas.width - 40, 14);
      }
    }

    if (transitionProgress < 1) {
      requestAnimationFrame(step);
    } else {
      transitioning = false;
      if (callback) callback();
    }
  }
  requestAnimationFrame(step);
}

// move to next scene with transitions
function nextScene() {
  if (transitioning) return;

  if (scene < dialogues.length - 1) {
    scene++;
    if (scene === 0) {
      transitionType = "fadeIn";
      animateTransition();
    } else {
      transitionType = "pageFlip";
      animateTransition();
    }
  } else {
    transitionType = "fadeOut";
    animateTransition(() => {
      console.log("Cutscenes finished – ready for gameplay!");
    });
  }
}

// controls
document.getElementById("startBtn").addEventListener("click", () => {
  nextScene();
});
canvas.addEventListener("click", nextScene);
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") nextScene();
});
