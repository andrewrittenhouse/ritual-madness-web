const BASE_COLOR = 'black';
const NOISE_COLORS = ['#fefe22', '#ff00ff', '#00ff00', '#ff0000'];
const NOISE_LEVELS = [0, 0.05, 0.25, 0.5, 0.9, 1];

function createAnimator(canvas, { devicePixelRatio, radius }) {
  const ctx = canvas.getContext('2d');

  const shapes = Array.from(Array(42).keys()).filter(pointCount => pointCount >= 2).map(pointCount => createMagicShape({ pointCount, radius }));

  return {
    start() {
      const startTime = Date.now();

      let prev;

      const next = () => {
        requestAnimationFrame(() => {
          try {
            const x = Math.floor((Date.now() - startTime) / 100);

            if (x === prev) {
              return;
            }

            prev = x;

            const a = shapes.length - 1;

            const shape = shuffle(shapes[a - Math.abs(x % (a * 2) - a)]);
            const noiseLevel = NOISE_LEVELS[(NOISE_LEVELS.length - 1) - Math.abs((Math.floor(x / (a * 2)) % ((NOISE_LEVELS.length - 1) * 2)) - (NOISE_LEVELS.length - 1))];
            const noiseColorIndex = Math.floor(x / (a * 2 * ((NOISE_LEVELS.length - 1) * 2))) % NOISE_COLORS.length;
        
            drawMagicShape(ctx, canvas.height, canvas.width, { noiseColorIndex, noiseLevel, shape });
          } catch (error) {
            console.err(error);
          } finally {
            next();
          }
        });
      };

      next();
    }
  }
}

function createMagicShape({ pointCount, radius }) {
  return Array.from(Array(pointCount).keys())
    .map((pointIndex) => {
      const angle = Math.PI + ((2 * pointIndex * Math.PI) / pointCount);

      const x = Math.floor(Math.sin(angle) * radius) + radius;
      const y = Math.floor(Math.cos(angle) * radius) + radius;

      return [x, y];
    })
    .reduce((lines, pointA, i, points) => {
      for (let ii = i + 1; ii < points.length; ii++) {
        lines.push([pointA, points[ii]]);
      }

      return lines;
    }, []);
}

function drawMagicShape(ctx, height, width, { noiseColorIndex, noiseLevel, shape }) {
  let previousStrokeStyle;

  ctx.clearRect(0, 0, width, height);

  for (let [pointA, pointB] of shape) {
    const strokeStyle = (Math.random() < noiseLevel) ? NOISE_COLORS[noiseColorIndex] : BASE_COLOR;

    if (strokeStyle !== previousStrokeStyle) {
      if (!!previousStrokeStyle) {
        ctx.stroke();
      }

      ctx.strokeStyle = strokeStyle;

      ctx.beginPath();
    }

    previousStrokeStyle = strokeStyle;

    ctx.moveTo(...pointA);
    ctx.lineTo(...pointB);
  }

  ctx.stroke();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const dest = Math.floor(Math.random() * i);
    const elem = arr[i];
    arr[i] = arr[dest];
    arr[dest] = elem;
  }

  return arr;
}

onmessage = ({ data: { message, params: { canvas, devicePixelRatio, radius } } }) => {
  switch (message) {
    case 'animate':
      createAnimator(canvas, { devicePixelRatio, radius }).start();
      break;
    default:
      console.err(`Invalid Message: ${message}`);
  }
};