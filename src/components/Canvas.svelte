<script lang="ts">
  import { onMount } from 'svelte';
  import { Rect } from '../classes/rect';

  /* Canvas */
  let imgFile: HTMLImageElement;
  let refresh = false;
  let mask;
  let editorPanel: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let offscreenContext: CanvasRenderingContext2D;
  let storedRects: Rect[] = [];
  let scaleFactor: number = 1;
  let imgResizeObserver: ResizeObserver;
  const temptRect = new Rect();

  export function init(img, rects: Rect[] = []) {
    imgFile = img;
    refresh = true;

    canvas.width = imgFile.width;
    canvas.height = imgFile.height;

    const offscreen = <HTMLCanvasElement>canvas.cloneNode();
    offscreen.width = imgFile.width;
    offscreen.height = imgFile.height;
    offscreenContext = offscreen.getContext('2d');
    offscreenContext.drawImage(img, 0, 0);

    storedRects = [...storedRects, ...rects];

    imgResizeObserver.observe(imgFile);
    imgFile.style.maxWidth = '96vw';
    imgFile.style.maxHeight = '90vh';

    mouse.start(canvas);
    touch.start(canvas);
  }

  export function render() {
    return new Promise((resolve, reject) => {
      try {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = imgFile.naturalWidth;
        tmpCanvas.height = imgFile.naturalHeight;

        const tmpCtx = tmpCanvas.getContext('2d');
        tmpCtx.drawImage(imgFile, 0, 0);
        tmpCtx.drawImage(
          canvas,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          tmpCanvas.width,
          tmpCanvas.height
        );

        tmpCanvas.toBlob(resolve);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    requestAnimationFrame(mainLoop);

    imgResizeObserver = new ResizeObserver(() => {
      scaleFactor = imgFile.width / canvas.width;

      storedRects = storedRects.map((item) => {
        item.x = item.x * scaleFactor;
        item.y = item.y * scaleFactor;
        item.w = item.w * scaleFactor;
        item.h = item.h * scaleFactor;
        return item;
      });

      canvas.width = imgFile.width;
      canvas.height = imgFile.height;

      editorPanel.style.width = canvas.width + 'px';
      editorPanel.style.height = canvas.height + 'px';

      draw();
    });
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.stroke();
    ctx.rect(0, 0, canvas.width, canvas.height);

    storedRects.forEach((rect) => {
      const newRect = new Rect(rect, true);
      // kludge
      if (rect.y < 0) {
        return;
      }
      if (newRect.fill) {
        pixelerate(newRect);
      }
      drawRect(newRect, [10, 5]);
    });
    drawRect(temptRect, []);
  }

  function mainLoop() {
    if (refresh || mouse.down || mouse.up || mouse.button) {
      refresh = false;
      if (mouse.down) {
        mouse.down = false;
        temptRect.restart(mouse);
      } else if (mouse.button) {
        temptRect.update(mouse);
      } else if (mouse.up) {
        mouse.up = false;
        temptRect.release(mouse);
        if (temptRect.w && temptRect.h) {
          storedRects = [...storedRects, new Rect(temptRect)];
        }
        // console.log(storedRects);
      }
      draw();
    }
    requestAnimationFrame(mainLoop);
  }

  function drawRect(rect: Rect, lineDash: number[]) {
    if (rect.drawing) {
      ctx.strokeStyle = 'red';
      ctx.setLineDash(lineDash);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
  }

  async function pixelerate(rect: Rect): Promise<void> {
    const pixels = 10;
    const imageBitmap = await createImageBitmap(
      offscreenContext.canvas,
      rect.x,
      rect.y,
      rect.w,
      rect.h
    );
    const { width, height } = imageBitmap;

    const widthScale = pixels / width;
    const scaledHeight = Math.floor(height * widthScale) || 1;

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = pixels;
    tmpCanvas.height = scaledHeight;
    const tmpCtx = tmpCanvas.getContext('2d');

    // Draw the image onto a smaller canvas temporarily.
    tmpCtx.drawImage(imageBitmap, 0, 0, pixels, scaledHeight);

    // Enable pixeleration by disabling smoothing.
    ctx.imageSmoothingEnabled = false;
    // Draw the smaller image onto the canvas with the original size so that
    // it's pixelerated.
    ctx.drawImage(tmpCtx.canvas, 0, 0, pixels, scaledHeight, rect.x, rect.y, rect.w, rect.h);
    ctx.imageSmoothingEnabled = true;
  }

  function toggleMosaic(i) {
    const rectIndex = i;
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      storedRects[rectIndex].toggleSensitive();
      draw();
    };
  }

  function deleteRect(indexToRemove: number, e: Event) {
    // e.preventDefault();
    e.stopPropagation();
    storedRects = storedRects.filter((_, i) => i !== indexToRemove);
  }

  export function toggleMask() {
    mask = !mask;
  }

  const mouse = {
    button: false,
    x: 0,
    y: 0,
    down: false,
    up: false,
    element: null,
    bounds: null,
    event(e) {
      // if (e?.target != canvas && e.type != 'mousedown') return;

      const m = mouse;
      m.bounds = m.element.getBoundingClientRect();
      m.x = e.pageX - m.bounds.left - scrollX;
      m.y = e.pageY - m.bounds.top - scrollY;
      const prevButton = m.button;
      m.button = e.type === 'mousedown' ? true : e.type === 'mouseup' ? false : mouse.button;
      if (!prevButton && m.button) {
        m.down = true;
      }
      if (prevButton && !m.button) {
        m.up = true;
      }
    },
    start(element) {
      mouse.element = element;
      ['down', 'up', 'move'].forEach((name) =>
        document.addEventListener(`mouse${name}`, mouse.event)
      );
    }
  };

  const touch = {
    element: null,
    event(e) {
      if (e.target == canvas) e.preventDefault();

      const t = e.touches.length ? e.touches[0] : e.changedTouches[0];

      if (e.type === 'touchstart') {
        const mouseEvent = new MouseEvent('mousedown', t);
        document.dispatchEvent(mouseEvent);
      }

      if (e.type === 'touchend') {
        const mouseEvent = new MouseEvent('mouseup', t);
        document.dispatchEvent(mouseEvent);
      }

      if (e.type === 'touchmove') {
        const mouseEvent = new MouseEvent('mousemove', t);
        document.dispatchEvent(mouseEvent);
      }
    },
    start(element) {
      touch.element = element;
      ['start', 'end', 'move'].forEach((name) => {
        document.body.addEventListener(
          `touch${name}`,
          (e) => {
            if (e.target == canvas) e.preventDefault();
          },
          false
        );
        canvas.addEventListener(`touch${name}`, touch.event, false);
      });
    }
  };
</script>

<div class="container">
  <div class="editor">
    <div bind:this={editorPanel} class="editor-panel" class:mask name="map-panel">
      {#each storedRects as { x, y, w, h, text }, i}
        <button
          class="rect"
          style={`left:${x}px;top:${y}px;width:${w}px;height:${h}px`}
          on:click={toggleMosaic(i)}
        />
        <button on:click={(e) => deleteRect(i, e)} style={`left:${x}px;top:${y}px;`}>x</button>
      {/each}
    </div>
    <canvas bind:this={canvas} width={0} height={0} class:mask />
    <slot />
  </div>
</div>

<style>
  .mask {
    opacity: 0;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    width: 100%;
  }

  .editor-panel button {
    position: absolute;
    z-index: 1;
    background: rgb(87 87 87 / 50%);
    cursor: pointer;
    border: none;
    color: white;
  }

  .editor-panel button.rect {
    background: rgb(87 87 87 / 20%);
  }

  .editor-panel {
    position: absolute;
    width: 60px;
    height: 60px;
  }

  canvas {
    padding: 0;
    position: absolute;
    cursor: crosshair;

    /* max-width: 100%;
    max-height: 100%; */
  }
</style>
