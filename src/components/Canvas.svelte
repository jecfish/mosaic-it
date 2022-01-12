<script lang="ts">
  import { onMount } from 'svelte';

  /* Canvas */
  let imgFile: HTMLImageElement;
  let refresh = false;
  let canvas;
  let ctx;
  const storedRects = [];
  let imgResizeObserver;

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
    storedRects.forEach((rect) => rect.draw(ctx, { lineDash }));
    // ctx.strokeStyle = 'red';
    lineDash = [];
    rect.draw(ctx, { lineDash });
  }

  function mainLoop() {
    if (refresh || mouse.down || mouse.up || mouse.button) {
      refresh = false;
      if (mouse.down) {
        mouse.down = false;
        rect.restart(mouse);
      } else if (mouse.button) {
        rect.update(mouse);
      } else if (mouse.up) {
        mouse.up = false;
        rect.update(mouse);
        storedRects.push(rect.toRect());
      }
      draw();
    }
    requestAnimationFrame(mainLoop);
  }

  function mosaicIt() {
    storedRects.forEach((rect) => (rect.fill = true));
  }

  const rect = (() => {
    let x1, y1, x2, y2;
    let show = false;
    function fix() {
      rect.x = Math.min(x1, x2);
      rect.y = Math.min(y1, y2);
      rect.w = Math.max(x1, x2) - Math.min(x1, x2);
      rect.h = Math.max(y1, y2) - Math.min(y1, y2);
    }
    function draw(ctx, { lineDash }) {
      ctx.setLineDash(lineDash);

      // mosaic it
      if (this.fill) {
        ctx.fillStyle = 'white';
        // ctx.globalAlpha = .2;
        // ctx.filter = 'blur(10px)';
        ctx.fillRect(this.x, this.y, this.w, this.h);
      } else {
        ctx.strokeRect(this.x, this.y, this.w, this.h);
      }
    }
    const rect = { x: 0, y: 0, w: 0, h: 0, draw };
    const API = {
      restart(point) {
        x2 = x1 = point.x;
        y2 = y1 = point.y;
        fix();
        show = true;
      },
      update(point) {
        x2 = point.x;
        y2 = point.y;
        fix();
        show = true;
      },
      toRect() {
        show = false;
        return Object.assign({}, rect);
      },
      draw(ctx, options) {
        if (show) {
          rect.draw(ctx, options);
        }
      },
      show: false
    };
    return API;
  })();

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
    <button on:click={mosaicIt}>Apply</button>
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
