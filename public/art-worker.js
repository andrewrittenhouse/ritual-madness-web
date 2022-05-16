const ANIMATED_POINT_COUNT = 42;
const SHAPE_CACHE_SIZE = 102;

let radius = 100;

function calculatePoint({ pointCount, pointIndex, xOffset, yOffset }) {
  const angle = (((pointIndex) / pointCount) * 2 * Math.PI) + Math.PI;

  const x = (Math.sin(angle) * radius) + xOffset;
  const y = (Math.cos(angle) * radius) + yOffset;

  return [x, y];
}

function calculatePoints({ pointCount, xOffset, yOffset }) {
  const points = [];

  const factors = Array.from(Array(Math.floor(pointCount / 2)).keys()).filter(i => i > 1 && pointCount % i === 0);

  for (let i = 0; i < pointCount; i++) {
    if (factors.some(factor => i % factor === 0)) {
      continue;
    }

    points.push(calculatePoint({ pointCount, pointIndex: i, xOffset, yOffset }));
  }

  for (let factor of factors) {
    for (let i = 0; i < pointCount; i++) {
      if (i % factor !== 0) {
        continue;
      }

      if (factors.some(f => f > factor && i % f === 0)) {
        continue;
      }
      
      points.push(calculatePoint({ pointCount, pointIndex: i, xOffset, yOffset }));
    }
  }

  return points;
}

// (modified) https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
function scaleMagicCanvas(canvas, { size }) {
  // Set display size (css pixels).
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  // Set actual size in memory (scaled to account for extra pixel density).
  var scale = 1;window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.

  canvas.width = Math.floor(size * scale);
  canvas.height = Math.floor(size * scale);

  return scale;
}

let canvas;
let color = 'black';
let ctx;
let frameInterval;
let frozen = false;
let magicColors;
let magicColorIndex = 0;
let magicShapeIndex = 0;
let magicShapeIndexStep = 1;
let rotation = 0;
let runFrame;
let points;
let scale;
let staticColor;
let staticRate = 0;
let staticRateStep = 0.2;

const magicShapes = [];

function calculateInSemicircle({ pointCount, pointIndexes, percent }) {
  const pointIndexA = Math.min(...pointIndexes);
  const pointIndexB = Math.max(...pointIndexes);

  const threshold = pointCount * percent;

  return pointIndexB - pointIndexA < threshold || Math.abs(pointIndexB - pointCount - pointIndexA) < threshold;
}

function drawMagicShape() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = color;

  ctx.beginPath();


  for (let i = 0; i < points.length; i++) {
    for (let ii = i + 1; ii < points.length; ii++) {
          const pointA = points[i];
          const pointB = points[ii];

          if (Math.random() < staticRate) {
              ctx.stroke();

              ctx.strokeStyle = staticColor;

              ctx.beginPath();

              ctx.moveTo(...pointA);
              ctx.lineTo(...pointB);

              ctx.stroke();

              ctx.strokeStyle = color;

              ctx.beginPath();

              continue;
          }

          ctx.moveTo(...pointA);
          ctx.lineTo(...pointB);
      }
  }

  ctx.stroke();
}
 
function animate() {
  clearInterval(frameInterval);

  staticColor = magicColors[magicColorIndex];

  runFrame = () => { 
    //drawMagicShape();
  };

  frameInterval = setInterval(() => {
    if (frozen) {
      return;
    }

    const nextMagicShapeIndex = magicShapeIndex + magicShapeIndexStep;

    if ((magicShapeIndexStep < 0 && nextMagicShapeIndex < 0) || (magicShapeIndexStep > 0 && nextMagicShapeIndex > ANIMATED_POINT_COUNT - 1)) {
      magicShapeIndexStep = -magicShapeIndexStep;

      if (magicShapeIndexStep > 0) {
        const nextStaticRate = Math.round((staticRate + staticRateStep) * 100) / 100;

        if (nextStaticRate < 0 || nextStaticRate > 1) {
          staticRateStep = -staticRateStep;

          if (staticRateStep > 0) {
            if (magicColorIndex === magicColors.length - 1) {
              magicColorIndex = 0;
            } else {
              magicColorIndex++;
            }

            staticColor = magicColors[magicColorIndex];

            animate();
          }
        }

        staticRate = Math.round((staticRate + staticRateStep) * 100) / 100;
      }
    }

    magicShapeIndex += magicShapeIndexStep;

    points = magicShapes[magicShapeIndex];
    
    drawMagicShape();
  }, 100);
}

function animateCoolDown() {
  clearInterval(frameInterval);

  runFrame = () => { };

  const coolDownStaticRateStep = -staticRate / (magicShapeIndex + 1);

  magicShapeIndexStep = -Math.abs(magicShapeIndexStep);
  staticRateStep = -Math.abs(staticRateStep);

  frameInterval = setInterval(() => {
    staticRate = Math.max(staticRate + coolDownStaticRateStep, 0);

    if (magicShapeIndex + magicShapeIndexStep < 0) {
      staticRateStep = Math.abs(staticRateStep);

      animate();

      return;
    }

    if (magicShapeIndex + (magicShapeIndexStep * 2) < 0) {
      staticRate = 0;
    }

    magicShapeIndex += magicShapeIndexStep;

    points = magicShapes[magicShapeIndex];

    drawMagicShape();
  }, 100);
}

function animateSuperNova() {
  clearInterval(frameInterval);

  runFrame = () => {
    drawMagicShape();
  };

  magicShapeIndexStep = Math.abs(magicShapeIndexStep);
  staticRateStep = Math.abs(staticRateStep);

  const superNovaStaticRateStep = (1 - staticRate) / (ANIMATED_POINT_COUNT - magicShapeIndex);

  frameInterval = setInterval(() => {
    staticRate = Math.min(staticRate + superNovaStaticRateStep, 1);

    if (magicShapeIndex + magicShapeIndexStep > ANIMATED_POINT_COUNT - 1) {
      animateCoolDown();

      return;
    }

    if (magicShapeIndex + (magicShapeIndexStep * 2) > ANIMATED_POINT_COUNT - 1) {
      staticRate = 1;
    }

    magicShapeIndex += magicShapeIndexStep;

    points = magicShapes[magicShapeIndex];
  }, 100);
}

function initMagicCanvas(params) {
  canvas = params.canvas;
  magicColors = params.magicColors;
  scale = params.scale;

  ctx = canvas.getContext('2d');

  ctx.scale(scale, scale);

  for (let i = 2; i < SHAPE_CACHE_SIZE; i++) {
    magicShapes.push(calculatePoints({ pointCount: i, xOffset: radius, yOffset: radius }));
  }

  points = magicShapes[0];
}

function freeze() {
  frozen = !frozen;
}

onmessage = ({ data: { message, params = undefined } }) => {
  switch (message) {
    case 'animate':
      animate();
      break;
    case 'frame':
      runFrame && runFrame();
      break;
    case 'freeze':
      freeze();
      break;
    case 'init':
      initMagicCanvas(params);
      break;
    case 'supernova':
      animateSuperNova();
      break;
    default:
      console.err(`Invalid Message: ${message}`);
  }
};