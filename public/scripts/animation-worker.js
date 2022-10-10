const BASE_COLOR = 'black';
const NOISE_COLORS = ['#fefe22', '#ff00ff', '#00ff00', '#ff0000'];
const NOISE_LEVELS = [0, 0.05, 0.25, 0.5, 0.9, 1];

let _animator = undefined

function createAnimator(canvas, { radius }) {
  return {
    canvas,
    ctx: canvas.getContext('2d'),
    isStandby: false,
    shapes: Array.from(Array(42).keys()).filter(pointCount => pointCount >= 2).map(pointCount => createMagicShape({ pointCount, radius })),
    startTime: undefined,
    tick: undefined,
    next() {
      requestAnimationFrame(() => {
        if (this.isStandby) {
          return;
        }

        try {
          const tick = Math.floor((Date.now() - this.startTime) / 100);

          if (tick === this.tick) {
            return;
          }

          this.tick = tick;

          const a = this.shapes.length - 1;

          drawMagicShape(this.ctx, this.canvas.height, this.canvas.width, { 
            noiseColorIndex: Math.floor(tick / (a * 2 * ((NOISE_LEVELS.length - 1) * 2))) % NOISE_COLORS.length, 
            noiseLevel: NOISE_LEVELS[(NOISE_LEVELS.length - 1) - Math.abs((Math.floor(tick / (a * 2)) % ((NOISE_LEVELS.length - 1) * 2)) - (NOISE_LEVELS.length - 1))], 
            shape: shuffle(this.shapes[a - Math.abs(tick % (a * 2) - a)]) 
          });
        } catch (error) {
          console.err(error);
        } finally {
          this.next();
        }
      });
    },
    resume() {
      this.isStandby = false;
      this.next();
    },
    standby() {
      this.isStandby = true;
    },
    start() {
      this.startTime = Date.now();
      this.next();
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

onmessage = ({ data: { message, params: { canvas, radius } } }) => {
  switch (message) {
    case 'start':
      _animator = createAnimator(canvas, { radius });
      _animator.start();
      break;
    case 'resume':
      _animator.resume();
      break;
    case 'standby':
      _animator.standby();
      break;
    default:
      throw new Error(`Invalid Message: ${message}`)
  }
};