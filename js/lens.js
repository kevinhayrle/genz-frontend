// =====================================
// CAMERA COLOR DETECTION FOR PALETTE
// =====================================

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const openCameraBtn = document.getElementById("openCameraBtn");
const switchCameraIcon = document.getElementById("switchCameraIcon");
const captureBtn = document.getElementById("captureBtn");
const searchBtn = document.getElementById("searchBtn");
const colorResult = document.getElementById("colorResult");

let stream = null;
let facingMode = "environment";

// ==============================
// START CAMERA
// ==============================

async function startCamera() {

  if (stream) {
    stream.getTracks().forEach(t => t.stop());
  }

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode }
  });

  video.srcObject = stream;
  await video.play();

  searchBtn.disabled = true;
  colorResult.innerHTML = "";
}

// ==============================
// SWITCH FRONT / BACK CAMERA
// ==============================

function switchCamera() {
  facingMode = facingMode === "environment" ? "user" : "environment";
  startCamera();
}

// ==============================
// CAPTURE IMAGE
// ==============================

function captureImage() {

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  // Stop camera
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
  }

  video.srcObject = null;

  searchBtn.disabled = false;
}

// ==============================
// RGB → HSV
// ==============================

function rgbToHsv(r, g, b) {

  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r,g,b);
  const min = Math.min(r,g,b);
  const d = max - min;

  let h = 0;

  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;

    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return { h, s, v };
}

// ==============================
// COLOR FAMILY DETECTION
// ==============================

function getColorName(r, g, b) {

  const { h, s, v } = rgbToHsv(r, g, b);

  if (v < 0.2) return "black";
  if (v > 0.9 && s < 0.25) return "white";

  if (s < 0.25) {
    if (v < 0.6) return "brown";
    return "white";
  }

  if (b > r * 1.1 && b > g * 1.05) return "blue";
  if (h >= 35 && h <= 65) return "yellow";
  if (h > 65 && h <= 160) return "green";
  if (h > 160 && h <= 260) return "blue";
  if (h > 260 && h <= 320) return "purple";
  if ((h < 20 || h > 340) && v > 0.65) return "pink";
  if (h < 20 || h > 340) return "red";

  return "brown";
}

// ==============================
// DETECT COLOR FROM CENTER AREA
// ==============================

function detectColor() {

  const data = ctx.getImageData(
    canvas.width * 0.3,
    canvas.height * 0.3,
    canvas.width * 0.4,
    canvas.height * 0.4
  ).data;

  let r = 0, g = 0, b = 0, count = 0;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  const detectedColor = getColorName(r, g, b);

  colorResult.innerHTML = `
    <strong>Detected:</strong> ${detectedColor.toUpperCase()}
  `;

  filterColorsByFamily(detectedColor);
}

// ==============================
// FILTER YOUR EXISTING PALETTE
// ==============================

function filterColorsByFamily(colorFamily) {

  const palette = document.getElementById("colorPalette");

  if (!palette) return;

  palette.innerHTML = "";

  if (!COLOR_PALETTE[colorFamily]) {
    renderColorPalette(); // fallback
    return;
  }

  COLOR_PALETTE[colorFamily].forEach(color => {

    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.background = color.hex;
    swatch.title = color.name;

    swatch.onclick = () => {
      document.querySelectorAll(".color-swatch")
        .forEach(s => s.classList.remove("active"));

      swatch.classList.add("active");
      selectedColor = color;
    };

    palette.appendChild(swatch);
  });
}

// ==============================
// EVENT BINDINGS
// ==============================

openCameraBtn.onclick = startCamera;
switchCameraIcon.onclick = switchCamera;
captureBtn.onclick = captureImage;
searchBtn.onclick = detectColor;