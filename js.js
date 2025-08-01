const loaderSection = document.getElementById("loaderSection");
const loaderProgress = document.getElementById("loaderProgress");
const loaderGradient = document.getElementById("loaderGradient");

const startPopup = document.getElementById("startPopup");
const activateBtn = document.getElementById("activateBtn");
const gameScreen = document.getElementById("gameScreen");
const spinBtn = document.getElementById("spinBtn");
const freeSpinsCount = document.getElementById("freeSpinsCount");
const finalPopup = document.getElementById("finalPopup");
const countdownEl = document.getElementById("countdown");
const coconutWidth = 80;
const containerWidth = document.getElementById("loaderContainer").offsetWidth;

let spinsLeft = 3;
let currentSpin = 0;

const slots = {
  col1: [
    "./images/slot_1_1.webp",
    "./images/slot_1_2.webp",
    "./images/slot_1_3.webp",
    "./images/slot_4_1.webp",
    "./images/slot_6_1.webp",
  ],
  col2: [
    "./images/slot_2_1.webp",
    "./images/slot_2_2.webp",
    "./images/slot_2_3.webp",
    "./images/slot_4_3.webp",
    "./images/slot_5_1.webp",
  ],
  col3: [
    "./images/slot_3_1.webp",
    "./images/slot_3_2.webp",
    "./images/slot_3_3.webp",
    "./images/slot_5_2.webp",
    "./images/slot_4_2.webp",
  ],
};

window.onload = () => {
  let progress = 0;
  const loadingInterval = setInterval(() => {
    if (progress >= 100) {
      clearInterval(loadingInterval);
      loaderSection.style.display = "none";
      gameScreen.classList.remove("hidden");
      startPopup.removeAttribute("x-cloak");
    } else {
      progress += 1;
      const position =
        (containerWidth + coconutWidth) * (progress / 100) - coconutWidth;
      loaderProgress.style.transform = `translateX(${position}px)`;
      // Оновлюємо градієнт
      loaderGradient.style.width = `${progress}%`;
    }
  }, 30);

  fillSlotColumns();
};

function fillSlotColumns() {
  Object.keys(slots).forEach((colId) => {
    const col = document.getElementById(colId);
    col.innerHTML = "";

    const uniqueImages = getRandomUniqueImages(slots[colId], 3);
    uniqueImages.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.classList.add("slot-item");
      col.appendChild(img);
    });
  });
}

function getRandomUniqueImages(array, count) {
  const available = [...array];
  const result = [];
  while (result.length < count && available.length > 0) {
    const index = Math.floor(Math.random() * available.length);
    result.push(available[index]);
    available.splice(index, 1);
  }
  return result;
}

activateBtn.onclick = () => {
  startPopup.style.display = "none";
};

spinBtn.onclick = async () => {
  if (spinsLeft === 0) return;
  spinBtn.disabled = true;
  spinBtn.classList.add("spinning");

  const initialSpeed = 80;
  const slowdownThreshold = 0.7;
  const finalSlowdownSteps = 8;
  const columnDelay = 300;

  const animations = ["col1", "col2", "col3"].map((colId, index) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const col = document.getElementById(colId);
        const items = Array.from(col.children);
        const values = items.map((item) => item.src);

        let spinCount = 0;
        const totalSpins = 15 + Math.floor(Math.random() * 5);
        let currentSpeed = initialSpeed;
        let isSlowingDown = false;

        function spinStep() {
          spinCount++;

          const first = values.shift();
          values.push(first);

          col.innerHTML = "";
          values.forEach((src) => {
            const img = document.createElement("img");
            img.src = src;
            img.classList.add("slot-item");
            col.appendChild(img);
          });

          if (!isSlowingDown && spinCount >= totalSpins * slowdownThreshold) {
            isSlowingDown = true;
          }

          if (isSlowingDown) {
            const progress =
              (spinCount - totalSpins * slowdownThreshold) /
              (totalSpins * (1 - slowdownThreshold) + finalSlowdownSteps);
            currentSpeed = initialSpeed + progress * 500;
          }

          if (spinCount < totalSpins + finalSlowdownSteps) {
            setTimeout(spinStep, currentSpeed);
          } else {
            if (spinsLeft === 1) {
              col.children[1].src = "./images/slot_winner.webp";
            }

            const centerImg = col.children[1];
            if (centerImg.src.includes("slot_winner.webp")) {
              centerImg.classList.add("flash-border");
              setTimeout(() => {
                centerImg.classList.remove("flash-border");
              }, 1200);
            } else {
              gsap.to(centerImg, {
                scale: 1.1,
                boxShadow: "0 0 15px 8px rgba(255, 255, 0, 0.7)",
                duration: 0.3,
                yoyo: true,
                repeat: 1,
              });
            }

            resolve();
          }
        }

        spinStep();
      }, index * columnDelay);
    });
  });

  await Promise.all(animations);

  spinsLeft--;
  currentSpin++;
  freeSpinsCount.innerText = spinsLeft;
  spinBtn.disabled = false;
  spinBtn.classList.remove("spinning");

  if (spinsLeft === 0) {
    setTimeout(() => {
      gameScreen.style.display = "hidden";
      finalPopup.style.display = "flex";
      startCountdown();
    }, 1500);
  }
};

function startCountdown() {
  let minutes = 15;
  let seconds = 0;

  const timer = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timer);
        return;
      }
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }

    document.getElementById("countdown-minutes").innerText = minutes;
    document.getElementById("countdown-seconds").innerText = seconds
      .toString()
      .padStart(2, "0");
  }, 1000);
}

// Add flash animation style
const style = document.createElement("style");
style.textContent = `
  .flash-border {
    animation: flash 1.2s ease-in-out infinite alternate;
    border: 4px solid yellow;
    border-radius: 8px;
  }

  @keyframes flash {
    0% { box-shadow: 0 0 10px 4px yellow; }
    100% { box-shadow: 0 0 20px 10px orange; }
  }
`;
document.head.appendChild(style);
