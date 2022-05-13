function calculateAngle(index, pointCount) {
    return (((index + 1) / pointCount) * 2 * Math.PI) + Math.PI;
}

function calculatePoints({ pointCount, radius, xOffset, yOffset }) {
    const points = [];

    for (let i = 0; i < pointCount; i++) {
        const angle = calculateAngle(i, pointCount);

        const x = Math.sin(angle) * radius + xOffset;
        const y = Math.cos(angle) * radius + yOffset;

        points.push([x, y]);
    }

    return points;
}

function drawMagicShape(canvas, ctx, { asymmetry, points, beamProbability, beamColor }) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';

    ctx.beginPath();

    const missingPointCount = Math.round(points.length * asymmetry);

    const startIndex = missingPointCount;
    const endIndex = points.length - missingPointCount;

    const disconnectedPointCount = missingPointCount * 2;

    for (let i = startIndex; i < endIndex; i++) {
        for (let ii = i + 1; ii < endIndex; ii++) {
            if ((i < startIndex + disconnectedPointCount || i > endIndex - disconnectedPointCount) && (ii < startIndex + disconnectedPointCount || ii > endIndex - disconnectedPointCount)) {
                continue;
            }

            const pointA = points[i];
            const pointB = points[ii];
            
            if (Math.random() < beamProbability) {
                ctx.stroke();

                ctx.strokeStyle = beamColor;

                ctx.beginPath();

                ctx.moveTo(...pointA);
                ctx.lineTo(...pointB);

                ctx.stroke();

                ctx.strokeStyle = 'black';

                ctx.beginPath();

                continue;
            }

            ctx.moveTo(...pointA);
            ctx.lineTo(...pointB);
        }
    }

    ctx.stroke();
}

// (modified) https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
function initMagicCanvas(canvas, ctx, { size }) {
    // Set display size (css pixels).
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";

    // Set actual size in memory (scaled to account for extra pixel density).
    var scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    console.log({scale})
    canvas.width = Math.floor(size * scale);
    canvas.height = Math.floor(size * scale);

    // Normalize coordinate system to use CSS pixels.
    ctx.scale(scale, scale);
}