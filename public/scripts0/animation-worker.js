const BASE_COLOR = 'black';
const NOISE_COLORS = ['#fefe22', '#ff00ff', '#00ff00', '#ff0000'];
const NOISE_STEP = 5;

function createMagicShape({ pointCount, radius }) {
  return Array.from(Array(pointCount).keys())
    .map((pointIndex) => {
      const angle = Math.PI + ((2 * pointIndex * Math.PI) / pointCount);

      const x = (Math.sin(angle) * radius) + radius;
      const y = (Math.cos(angle) * radius) + radius;

      return [x, y];
    })
    .reduce((lines, pointA, i, points) => {
      for (let ii = i + 1; ii < points.length; ii++) {
        lines.push([pointA, points[ii]]);
      }

      return lines;
    }, []);
}

function createAnimator(canvas, { devicePixelRatio, radius }) {
  const ctx = canvas.getContext('2d');

  ctx.scale(devicePixelRatio, devicePixelRatio);

  const shapes = Array.from(Array(42).keys()).filter(pointCount => pointCount >= 2).map(pointCount => createMagicShape({ pointCount, radius }));

  return {
    start() {
      let i = 0;
    
      setInterval(() => {
        i++;
      }, 100);

      let prev;

      const next = () => {
        requestAnimationFrame(() => {
          if (i === prev) {
            next();
            return;
          }

          prev = i;
            
          const a = shapes.length - 1;
          const shape = shuffle(shapes[a - Math.abs(i % (a * 2) - a)]);
          //const noiseLevel = Math.abs(((Math.floor(i / (a * 2) + NOISE_STEP)) % (NOISE_STEP * 2)) - NOISE_STEP) / NOISE_STEP;
          const top = a;
          const spread = 5;
          const x = Math.floor(i / (a * 2)) % 5;
          const noiseLevel = Math.pow((1 / (spread * Math.sqrt(2 * Math.PI))) * Math.E, -1 * (Math.pow(x - top, 2) / Math.pow(2 * spread, 2)));
          const noiseColorIndex = Math.floor(i / (a * 2 * (NOISE_STEP * 2))) % NOISE_COLORS.length;
      
          console.log({x, noiseLevel})

          drawMagicShape(ctx, canvas.height, canvas.width, { noiseColorIndex, noiseLevel, shape });

          next();
        });
      };

      next();
    }
  }
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