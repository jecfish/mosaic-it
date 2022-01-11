<script lang="ts">
import { onMount } from 'svelte';

/* Canvas */
let imgFile;
let canvas;
let ctx;
let flag = false;
let prevRect = undefined;

let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

let color = 'black';
let thickness = 15;

export function draw(droppedFile) {
    ctx = canvas.getContext('2d');
    canvas.width = droppedFile.width;
    canvas.height = droppedFile.height;
    ctx.drawImage(droppedFile, 0, 0, canvas.width, canvas.height);
}

function drawRect(e) {
    const offsetX = getOffset(canvas).left;
    const offsetY = getOffset(canvas).top;

    if (e.type == 'mousedown') {
        // set a flag indicating the drag has begun
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        flag = true;
    }
    if (e.type == 'mouseup' || e.type == 'mouseout') {
        // the drag is over, clear the dragging flag
        flag = false;
    }
    if (e.type == 'mousemove') {
        if (!flag) return;
        
        // Draw free form
        // ctx.beginPath();
        // ctx.moveTo(startX, startY);
        // ctx.lineTo(endX, endY);
        // ctx.strokeStyle = color;
        // ctx.lineWidth = thickness;
        // ctx.stroke();
        // ctx.closePath();
        // ctx.strokeStyle = 'green';
        // ctx.globalAlpha = 0.1;
        // ctx.strokeRect(prevRect.startX,prevRect.startY,prevRect.width,prevRect.height);

        // Draw rectangle
        const mouseX = e.clientX - offsetX;
        const mouseY = e.clientY - offsetY;
        const width = mouseX - startX;
        const height = mouseY - startY;
        if (prevRect) {
            ctx.clearRect(prevRect.startX,prevRect.startY,prevRect.width,prevRect.height);
        }
        prevRect = {startX,startY,width,height}
        ctx.beginPath();
        ctx.rect(prevRect.startX,prevRect.startY,prevRect.width,prevRect.height);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.lineWidth = 7;
        ctx.strokeStyle = 'black';
        ctx.stroke();
        
    }
}

function getOffset(element) {
    if (!element.getClientRects().length) {
        return { top: 0, left: 0 };
    }

    let rect = element.getBoundingClientRect();
    let win = element.ownerDocument.defaultView;
    return {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset
    };
}
</script>

<canvas
    bind:this={canvas}
    width={0}
    height={0}
    on:mouseup={drawRect}
    on:mouseout={drawRect}
    on:mousemove={drawRect}
    on:mousedown={drawRect}
    on:blur={drawRect}
/>

<style>
canvas {
    margin: auto;
    padding: 0;
    position: relative;
    display: block;
}
</style>