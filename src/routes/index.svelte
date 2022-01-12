<script lang="ts">
  import { onMount } from 'svelte';
  import Canvas from '../components/Canvas.svelte';
  import Controls from '../components/Controls.svelte';
  import { Rect } from '../classes/rect';
  import { createWorker } from 'tesseract.js';

  let droppedFile: HTMLImageElement;
  let fileUrl: string;
  let file: File;
  let isFileDropMode: boolean = true;
  let detectedWords: Tesseract.Word[] = [];
  const worker = createWorker();

  let canvasCmp;

  onMount(async () => {
    // https://kit.svelte.dev/faq#:~:text=How%20do%20I%20use%20a%20client%2Dside%20only%20library%20that%20depends%20on%20document%20or%20window%3F
    await import('file-drop-element');
    // await import('pinch-zoom-element');

    const onmessage = (event: MessageEvent) => {
      console.log(event);
      if (event.data.action !== 'load-image') return;
      handleFileDrop({ files: [event.data.file] });
      navigator.serviceWorker.removeEventListener('message', onmessage);
    };

    navigator.serviceWorker.addEventListener('message', onmessage);
    navigator.serviceWorker.controller?.postMessage('share-ready');
  });

  async function detectText(file: File): Promise<Tesseract.Page> {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(file);
    await worker.terminate();
    return data;
  }

  async function handleFileDrop(fileDropEvent): Promise<void> {
    file = fileDropEvent.files[0];
    if (fileUrl != undefined) {
      URL.revokeObjectURL(fileUrl);
    }

    const { words } = await detectText(file);
    detectedWords = words;

    fileUrl = URL.createObjectURL(file);
    isFileDropMode = false;
  }

  function drawImage() {
    const rects: any[] = [];
    if (detectedWords.length !== 0) {
      detectedWords.forEach((word) => {
        console.log(word);
        const show = word.confidence < 70.0;
        const fill = false;
        const { x0: x, y0: y, x1, y1 } = word.bbox;
        const w = x1 - x;
        const h = y1 - y;
        const rect = new Rect({ x, y, w, h, fill }, show);
        // Why can't I simply add a `Rect` instance???
        rects.push(rect.toRect());
      });
    }
    canvasCmp.init(droppedFile, rects);
  }
</script>

<svelte:head>
  <style>
    html,
    body {
      margin: 0;
      padding: 0;
      position: relative;
      width: 100%;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
        Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    }

    div#svelte {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  </style>
</svelte:head>
<div class="canvas-container" class:hide={isFileDropMode}>
  <Canvas bind:this={canvasCmp} />
</div>

{#if fileUrl == undefined}
  <file-drop on:filedrop={handleFileDrop} accept="image/*" class:hide={!isFileDropMode}>
    <input
      id="file-picker"
      class="file-picker__input"
      type="file"
      accept="image/*"
      on:change={(e) => handleFileDrop(e.target)}
    />
    <label for="file-picker" class="file-picker__label">
      <h1>Drop or select an image to start auto mosaic.</h1>
      <svg viewBox="0 0 24 24" class="file-picker__icon">
        <path
          d="M19 7v3h-2V7h-3V5h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5a2 2 0 00-2 2v12c0 1.1.9 2 2 2h12a2 2 0 002-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"
        />
      </svg>
    </label>
  </file-drop>
{:else}
  <img
    bind:this={droppedFile}
    alt=""
    src={fileUrl}
    on:load={drawImage}
    style="max-width:100%;max-height:90vh;"
  />
{/if}

<div id="control-container"><Controls {file} {fileUrl} /></div>

<style>
  #control-container {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 2em;
    padding: 1em;
    border-radius: 2em;
    background-color: hotpink;
  }

  .canvas-container {
    display: flex;
  }

  file-drop {
    margin-top: 9vh;
    height: 80vh;
    width: 80vw;
    border-radius: 10px;
    box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 10px dashed #b8daff;
    background: #f4f8ff;
  }

  .hide {
    display: none;
  }

  .file-picker__input {
    display: none;
  }

  .file-picker__label {
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: #0a7df8;
  }

  .file-picker__icon {
    fill: #0a7df8;
    width: 10rem;
    height: 10rem;
  }

  :global(file-drop.drop-valid) {
    background-color: #d4edda;
    border-color: #c3e6cb;
  }

  :global(file-drop.drop-invalid) {
    background-color: #f8d7da;
    border-color: #f5c6cb;
  }
</style>
