const offsetX = document.getElementById("offset-x");
const offsetXNumber = document.getElementById("offset-x-number");

const offsetY = document.getElementById("offset-y");
const offsetYNumber = document.getElementById("offset-y-number");

const blur = document.getElementById("blur");
const blurNumber = document.getElementById("blur-number");

const spread = document.getElementById("spread");
const spreadNumber = document.getElementById("spread-number");

const color = document.getElementById("color");
const colorText = document.getElementById("color-text");

const opacity = document.getElementById("opacity");
const opacityNumber = document.getElementById("opacity-number");

const inset = document.getElementById("inset");

const previewBox = document.getElementById("preview-box");
const code = document.getElementById("code");
const copyButton = document.getElementById("copy-button");

function hexToRgba(hex, alpha) {
  hex = hex.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateShadow() {
  const x = offsetX.value;
  const y = offsetY.value;
  const blurValue = blur.value;
  const spreadValue = spread.value;

  const alpha = opacity.value / 100;
  const shadowColor = hexToRgba(color.value, alpha);

  const shadowType = inset.checked ? "inset " : "";

  const shadow = `${shadowType}${x}px ${y}px ${blurValue}px ${spreadValue}px ${shadowColor}`;

  previewBox.style.boxShadow = shadow;

  code.value = `box-shadow: ${shadow};`;
}

function connectRange(range, number) {
  range.addEventListener("input", () => {
    number.value = range.value;
    updateShadow();
  });

  number.addEventListener("input", () => {
    range.value = number.value;
    updateShadow();
  });
}

connectRange(offsetX, offsetXNumber);
connectRange(offsetY, offsetYNumber);
connectRange(blur, blurNumber);
connectRange(spread, spreadNumber);
connectRange(opacity, opacityNumber);

color.addEventListener("input", () => {
  colorText.value = color.value.toUpperCase();
  updateShadow();
});

colorText.addEventListener("input", () => {
  if (/^#[0-9A-Fa-f]{6}$/.test(colorText.value)) {
    color.value = colorText.value;
    updateShadow();
  }
});

inset.addEventListener("change", updateShadow);

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(code.value);

  copyButton.textContent = "Copied!";

  setTimeout(() => {
    copyButton.textContent = "Copy CSS";
  }, 1200);
});

updateShadow();
