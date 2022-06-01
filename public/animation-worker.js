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

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const dest = Math.floor(Math.random() * i);
    const elem = arr[i];
    arr[i] = arr[dest];
    arr[dest] = elem;
  }

  return arr;
}
 
function animate(canvas, { devicePixelRatio, radius }) {
  const ctx = canvas.getContext('2d');

  ctx.scale(devicePixelRatio, devicePixelRatio);

  const shapes = Array.from(Array(42).keys()).filter(pointCount => pointCount >= 2).map(pointCount => createMagicShape({ pointCount, radius }));

  const amp = shapes.length - 1;

  let i = 0;

  setInterval(() => {
    requestAnimationFrame(() => {
      const shapeIndex = amp - Math.abs(i % (amp * 2) - amp);
      const noiseLevel = Math.abs(((Math.floor(i / (amp * 2) + NOISE_STEP)) % (NOISE_STEP * 2)) - NOISE_STEP) / NOISE_STEP;
      const noiseColorIndex = Math.floor(i / (amp * 2 * (NOISE_STEP * 2))) % NOISE_COLORS.length;

      const lines = shuffle(shapes[shapeIndex]);

      let previousStrokeStyle;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let [pointA, pointB] of lines) {
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
    });

    i++;
  }, 100);
}

onmessage = ({ data: { message, params: { canvas, devicePixelRatio, radius } } }) => {
  switch (message) {
    case 'animate':
      animate(canvas, { devicePixelRatio, radius });
      break;

    default:
      console.err(`Invalid Message: ${message}`);
  }
};