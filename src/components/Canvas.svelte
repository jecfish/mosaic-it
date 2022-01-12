<script lang="ts">
  import { onMount } from 'svelte';
  import { Rect } from '../classes/rect';

  /* Canvas */
  let imgFile: HTMLImageElement;
  let refresh = false;
  let canvas;
  let ctx;
  const storedRects = [];
  let imgResizeObserver;
  const temptRect = new Rect();

  export function init(img) {
    imgFile = img;
    // imgResizeObserver.observe(imgFile);
    refresh = true;

    canvas.width = imgFile.width;
    canvas.height = imgFile.height;

    draw();
    imgFile.style.display = 'none';

    mouse.start(canvas);
    touch.start(canvas);
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    requestAnimationFrame(mainLoop);

    // TODO: Support resize and redraw
    // imgResizeObserver = new ResizeObserver((entries) => {
    //   console.log('image resize:', entries);
    // });
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgFile, 0, 0, canvas.width, canvas.height);
    let lineDash = [20, 5];
    storedRects.forEach((item) => {
      const r = new Rect(item, true);
      r.draw(ctx, { lineDash });
    });
    // ctx.strokeStyle = 'red';
    lineDash = [];
    temptRect.draw(ctx, { lineDash });
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
        temptRect.update(mouse);
        storedRects.push(temptRect.toRect());
        // console.log(storedRects);
      }
      draw();
    }
    requestAnimationFrame(mainLoop);
  }

  function mosaicIt() {
    storedRects.forEach((item) => (item.fill = true));
    draw();
  }

  function autoDetect() {
    // TODO: Auto detect logic
    // confirm case
    storedRects.push({ x: 252, y: 83, w: 27, h: 27, fill: true});

    // unsure case
    storedRects.push({ x: 122, y: 56, w: 44, h: 36, fill: false});
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
      ['start', 'end', 'move'].forEach((name) =>
        document.addEventListener(`touch${name}`, touch.event, { passive: false })
      );
    }
  };
</script>

<div class="container">
  <div class="controls">
    <button on:click={mosaicIt}>Apply mosaic</button>
    <button on:click={autoDetect}>Auto detect mosaic area</button>
  </div>
  <canvas bind:this={canvas} width={0} height={0} />
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    width: 100%;
  }

  .controls {
    margin: 20px;
  }

  canvas {
    /* margin: auto; */
    padding: 0;
    position: relative;
    display: block;
    cursor: crosshair;

    /* max-width: 100%;
    max-height: 100%; */
  }
</style>
