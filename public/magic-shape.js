function calculateAngle(index, pointCount) {
    return (((index + 1) / pointCount) * 2 * Math.PI) + Math.PI;
}


function drawMagicShape(canvas, ctx, { pointCount, radius }) {
    const points = [];

    for (let i = 0; i < pointCount; i++) {
        const angle = calculateAngle(i, pointCount);

        const x = Math.sin(angle) * radius + (canvas.width / 2);
        const y = Math.cos(angle) * radius + (canvas.height / 2);

        points.push([x, y]);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;

    ctx.beginPath();

    for (let i = 0; i < pointCount; i++) {
        for (let ii = i + 1; ii < pointCount; ii++) {
            const pointA = points[i];
            const pointB = points[ii];

            ctx.moveTo(...pointA);
            ctx.lineTo(...pointB);

            ctx.stroke();
        }
    }
}