<script lang="ts">
  import { onMount } from 'svelte';
  import { Rect } from '../classes/rect';

  /* Canvas */
  let imgFile: HTMLImageElement;
  let refresh = false;
  let mask = false;
  let canvas;
  let ctx;
  const storedRects = [];
  let imgResizeObserver;
  const temptRect = new Rect();

  export function init(img, rects: Rect[] = []) {
    imgFile = img;
    // imgResizeObserver.observe(imgFile);
    refresh = true;

    canvas.width = imgFile.width;
    canvas.height = imgFile.height;

    storedRects.push(...rects);
    draw();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // experiment pixelate
    // console.log(ctx.getImageData( 0, 0, canvas.width, canvas.height).data);
    // const sample_size = 80;

    // for (let y = 0; y < h; y += sample_size) {
    //   for (let x = 0; x < w; x += sample_size) {
    //     let p = (x + (y*w)) * 4;
    //     ctx.fillStyle = "rgba(" + pixelArr[p] + "," + pixelArr[p + 1] + "," + pixelArr[p + 2] + "," + pixelArr[p + 3] + ")";
    //     ctx.fillRect(x, y, sample_size, sample_size);
    //   }
    // }

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
    // ctx.stroke();
    ctx.rect(0, 0, canvas.width, canvas.height);

    let lineDash = [10, 5];
    ctx.strokeStyle = 'red';

    storedRects.forEach((rect) => {
      new Rect(rect, true).draw(ctx, { lineDash });
    });
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
        storedRects.push(new Rect(temptRect));
        console.log(storedRects);
      }
      draw();
    }
    requestAnimationFrame(mainLoop);
  }

  function mosaicIt() {
    storedRects.map((item) => (item.fill = true));
    draw();
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
    <button on:click={() => (mask = !mask)}>
      {mask ? 'View masked' : 'View original'}
    </button>
  </div>
  <div class="editor">
    <!-- <div class='delete-buttons'></div> -->
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

  .controls {
    margin: 20px;
  }

  /* .delete-buttons {
    position: absolute;
    background-color: black;
    width: 60px;
    height: 60px;
  } */

  canvas {
    padding: 0;
    position: absolute;
    cursor: crosshair;

    /* max-width: 100%;
    max-height: 100%; */
  }
</style>
