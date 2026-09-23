const display = document.getElementById("display");
const expression = document.getElementById("expression");
const backgroundDecor = document.getElementById("backgroundDecor");

const settings = document.getElementById("settings");
const scientificPanel = document.getElementById("scientific");
const historyPanel = document.getElementById("history");

const settingsButton = document.getElementById("settingsButton");
const scientificButton = document.getElementById("scientificButton");
const historyButton = document.getElementById("historyButton");

const themeSelect = document.getElementById("themeSelect");
const accentPicker = document.getElementById("accentPicker");
const backgroundSelect = document.getElementById("backgroundSelect");
const decorOpacity = document.getElementById("decorOpacity");

let resetNext = false;
let calculationHistory =
  JSON.parse(localStorage.getItem("calculator-history")) || [];

const themes = {
  dark: {
    bg: "#111216",
    calc: "#1a1c21",
    screen: "#111317",
    button: "#25272d",
    hover: "#30333a",
    border: "#31343b",
    text: "#f5f5f5",
    muted: "#868a94",
    accent: "#e34d4d"
  },

  red: {
    bg: "#150d0f",
    calc: "#211719",
    screen: "#160f11",
    button: "#302124",
    hover: "#3b292d",
    border: "#493237",
    text: "#ffffff",
    muted: "#ad8c92",
    accent: "#ff4c55"
  },

  blue: {
    bg: "#0b1016",
    calc: "#141d27",
    screen: "#0c131a",
    button: "#1d2a37",
    hover: "#27394a",
    border: "#304459",
    text: "#ffffff",
    muted: "#8194a8",
    accent: "#4d9dff"
  },

  purple: {
    bg: "#110c17",
    calc: "#1c1625",
    screen: "#120d18",
    button: "#2a2036",
    hover: "#372947",
    border: "#45345a",
    text: "#ffffff",
    muted: "#9f8daf",
    accent: "#aa6cff"
  },

  green: {
    bg: "#09100c",
    calc: "#121d16",
    screen: "#0a120d",
    button: "#1c2d22",
    hover: "#263c2d",
    border: "#304d39",
    text: "#ffffff",
    muted: "#819b89",
    accent: "#47d66f"
  },

  light: {
    bg: "#e8e9ec",
    calc: "#f8f8f8",
    screen: "#ffffff",
    button: "#e5e6e9",
    hover: "#d9dade",
    border: "#ced0d5",
    text: "#17181b",
    muted: "#777b84",
    accent: "#e14d4d"
  }
};

function add(value) {
  if (display.value === "0" || display.value === "Erro" || resetNext) {
    display.value = "";
    resetNext = false;
  }

  display.value += value;
}

function clearDisplay() {
  display.value = "0";
  expression.textContent = "";
  resetNext = false;
}

function removeLast() {
  if (display.value === "Erro" || resetNext) {
    clearDisplay();
    return;
  }

  display.value = display.value.slice(0, -1);

  if (!display.value) {
    display.value = "0";
  }
}

function evaluate(value) {
  if (!/^[0-9+\-*/().\sEe]+$/.test(value)) {
    throw new Error("Expressão inválida");
  }

  const result = Function(`"use strict"; return (${value})`)();

  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("Resultado inválido");
  }

  return result;
}

function pretty(value) {
  return value
    .replaceAll("**", "^")
    .replaceAll("*", "×")
    .replaceAll("/", "÷");
}

function formatNumber(number) {
  if (Math.abs(number) >= 1e12 || (Math.abs(number) > 0 && Math.abs(number) < 1e-9)) {
    return Number(number).toExponential(8);
  }

  return parseFloat(Number(number).toFixed(10)).toString();
}

function calculate() {
  try {
    const original = display.value;
    const result = evaluate(original);
    const formatted = formatNumber(result);

    expression.textContent = `${pretty(original)} =`;
    display.value = formatted;

    saveHistory(pretty(original), formatted);
    resetNext = true;
  } catch {
    display.value = "Erro";
    expression.textContent = "Expressão inválida";
    resetNext = true;
  }
}

function percent() {
  try {
    const original = display.value;
    const number = evaluate(original);
    const result = formatNumber(number / 100);

    expression.textContent = `${pretty(original)}%`;
    display.value = result;
    saveHistory(`${pretty(original)}%`, result);
    resetNext = true;
  } catch {
    display.value = "Erro";
    resetNext = true;
  }
}

function changeSign() {
  try {
    const original = display.value;
    const number = evaluate(original);
    display.value = formatNumber(-number);
  } catch {
    display.value = "Erro";
    resetNext = true;
  }
}

function scientific(type) {
  try {
    const original = display.value;
    const input = evaluate(original);
    let result;

    if (type === "sin") result = Math.sin(input * Math.PI / 180);
    if (type === "cos") result = Math.cos(input * Math.PI / 180);
    if (type === "tan") result = Math.tan(input * Math.PI / 180);
    if (type === "sqrt") result = Math.sqrt(input);
    if (type === "log") result = Math.log10(input);
    if (type === "ln") result = Math.log(input);

    if (!Number.isFinite(result)) {
      throw new Error("Resultado inválido");
    }

    const formatted = formatNumber(result);
    const label =
      type === "sqrt"
        ? `√(${pretty(original)})`
        : `${type}(${pretty(original)})`;

    expression.textContent = label;
    display.value = formatted;

    saveHistory(label, formatted);
    resetNext = true;
  } catch {
    display.value = "Erro";
    expression.textContent = "Operação inválida";
    resetNext = true;
  }
}

function square() {
  try {
    const original = display.value;
    const value = evaluate(original);
    const result = formatNumber(value * value);
    const label = `${pretty(original)}²`;

    expression.textContent = label;
    display.value = result;
    saveHistory(label, result);
    resetNext = true;
  } catch {
    display.value = "Erro";
    resetNext = true;
  }
}

function addPi() {
  if (display.value === "0" || display.value === "Erro" || resetNext) {
    display.value = Math.PI.toString();
    resetNext = false;
    return;
  }

  display.value += Math.PI.toString();
}

function addE() {
  if (display.value === "0" || display.value === "Erro" || resetNext) {
    display.value = Math.E.toString();
    resetNext = false;
    return;
  }

  display.value += Math.E.toString();
}

function togglePanel(panel, button) {
  panel.classList.toggle("show");
  button.classList.toggle("active", panel.classList.contains("show"));
}

function saveHistory(calc, result) {
  calculationHistory.unshift({ calc, result });
  calculationHistory = calculationHistory.slice(0, 40);

  localStorage.setItem(
    "calculator-history",
    JSON.stringify(calculationHistory)
  );

  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  if (!calculationHistory.length) {
    list.innerHTML = '<div class="empty">Nenhum cálculo ainda.</div>';
    return;
  }

  calculationHistory.forEach((item) => {
    const div = document.createElement("div");
    div.className = "historyItem";

    const calc = document.createElement("div");
    calc.className = "historyCalc";
    calc.textContent = item.calc;

    const result = document.createElement("div");
    result.className = "historyResult";
    result.textContent = `= ${item.result}`;

    div.appendChild(calc);
    div.appendChild(result);

    div.addEventListener("click", () => {
      display.value = item.result;
      expression.textContent = item.calc;
      resetNext = false;
    });

    list.appendChild(div);
  });
}

function clearHistory() {
  calculationHistory = [];
  localStorage.removeItem("calculator-history");
  renderHistory();
}

function setTheme(name, save = true) {
  const theme = themes[name];
  if (!theme) return;

  const root = document.documentElement;

  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--calc", theme.calc);
  root.style.setProperty("--screen", theme.screen);
  root.style.setProperty("--button", theme.button);
  root.style.setProperty("--button-hover", theme.hover);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--accent", theme.accent);

  accentPicker.value = theme.accent;

  if (save) {
    localStorage.setItem("calculator-theme", name);
    localStorage.removeItem("calculator-color");
  }
}

function setCustomColor(color, save = true) {
  document.documentElement.style.setProperty("--accent", color);

  if (save) {
    localStorage.setItem("calculator-color", color);
  }
}


function setDecorOpacity(value, save = true) {
  const opacity = Math.max(0.05, Math.min(0.35, Number(value) / 100));
  document.documentElement.style.setProperty("--decor-opacity", opacity);

  if (save) {
    localStorage.setItem("calculator-decor-opacity", String(value));
  }
}

const wallpaperSets = {
  arcade: [
    "heart.png",
    "star.png",
    "diamond.png",
    "mushroom.png",
    "trophy.png",
    "chest.png",
    "bomb.png",
    "coin.png",
    "shield.png",
    "sword.png",
    "apple.png",
    "skull.png"
  ],
  hearts: ["heart.png"],
  stars: ["star.png"],
  mushrooms: ["mushroom.png"],
  diamonds: ["diamond.png"],
  treasure: ["chest.png", "coin.png", "diamond.png"],
  trophies: ["trophy.png", "star.png"]
};

const wallpaperSizes = {
  "heart.png": [62, 54],
  "star.png": [56, 56],
  "diamond.png": [66, 52],
  "mushroom.png": [66, 52],
  "trophy.png": [58, 64],
  "chest.png": [68, 57],
  "bomb.png": [58, 70],
  "coin.png": [54, 56],
  "shield.png": [54, 64],
  "sword.png": [58, 62],
  "apple.png": [52, 68],
  "skull.png": [55, 62]
};

function renderWallpaper(type) {
  backgroundDecor.innerHTML = "";

  if (type === "none") return;

  const files = wallpaperSets[type] || wallpaperSets.arcade;
  const spacingX = 138;
  const spacingY = 118;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const cols = Math.ceil(width / spacingX) + 2;
  const rows = Math.ceil(height / spacingY) + 2;

  let index = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const file = files[index % files.length];
      const size = wallpaperSizes[file] || [58, 58];

      const item = document.createElement("div");
      const image = document.createElement("img");

      item.className = "wallpaperItem";
      image.src = `assets/icons/${file}`;
      image.alt = "";
      image.draggable = false;

      item.style.width = `${size[0]}px`;
      item.style.height = `${size[1]}px`;

      const offsetX = row % 2 === 0 ? 0 : 68;
      item.style.left = `${col * spacingX + offsetX - 40}px`;
      item.style.top = `${row * spacingY - 32}px`;

      const rotation = ((row * 7 + col * 11) % 9) - 4;
      const scale = 0.88 + (((row + col) % 4) * 0.05);

      item.style.transform = `rotate(${rotation}deg) scale(${scale})`;

      item.appendChild(image);
      backgroundDecor.appendChild(item);

      index++;
    }
  }
}

function setBackgroundMode(mode, save = true) {
  renderWallpaper(mode);

  if (save) {
    localStorage.setItem("calculator-bg-mode", mode);
  }
}

document.querySelectorAll("[data-value]").forEach((button) => {
  button.addEventListener("click", () => add(button.dataset.value));
});

document.querySelectorAll("[data-scientific]").forEach((button) => {
  button.addEventListener("click", () => scientific(button.dataset.scientific));
});

document.getElementById("clearButton").addEventListener("click", clearDisplay);
document.getElementById("backspaceButton").addEventListener("click", removeLast);
document.getElementById("percentButton").addEventListener("click", percent);
document.getElementById("signButton").addEventListener("click", changeSign);
document.getElementById("equalsButton").addEventListener("click", calculate);
document.getElementById("piButton").addEventListener("click", addPi);
document.getElementById("eButton").addEventListener("click", addE);
document.getElementById("squareButton").addEventListener("click", square);
document.getElementById("clearHistoryButton").addEventListener("click", clearHistory);

scientificButton.addEventListener("click", () =>
  togglePanel(scientificPanel, scientificButton)
);

historyButton.addEventListener("click", () =>
  togglePanel(historyPanel, historyButton)
);

settingsButton.addEventListener("click", () =>
  togglePanel(settings, settingsButton)
);

themeSelect.addEventListener("change", () => {
  setTheme(themeSelect.value);
});

accentPicker.addEventListener("input", () => {
  setCustomColor(accentPicker.value);
});

backgroundSelect.addEventListener("change", () => {
  setBackgroundMode(backgroundSelect.value);
});


decorOpacity.addEventListener("input", () => {
  setDecorOpacity(decorOpacity.value);
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if ("0123456789+-*/().".includes(key)) {
    add(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === "Backspace") {
    removeLast();
    return;
  }

  if (key === "Escape") {
    clearDisplay();
    return;
  }

  if (key === "%") {
    percent();
  }
});

let resizeTimer;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    renderWallpaper(backgroundSelect.value);
  }, 120);
});

function loadPreferences() {
  const savedTheme = localStorage.getItem("calculator-theme") || "dark";

  if (themes[savedTheme]) {
    themeSelect.value = savedTheme;
    setTheme(savedTheme, false);
  }

  const savedColor = localStorage.getItem("calculator-color");

  if (savedColor) {
    accentPicker.value = savedColor;
    setCustomColor(savedColor, false);
  }


  const savedOpacity =
    localStorage.getItem("calculator-decor-opacity") || "15";

  decorOpacity.value = savedOpacity;
  setDecorOpacity(savedOpacity, false);

  const savedBackground =
    localStorage.getItem("calculator-bg-mode") || "none";

  backgroundSelect.value = savedBackground;
  setBackgroundMode(savedBackground, false);
}

loadPreferences();
renderHistory();
