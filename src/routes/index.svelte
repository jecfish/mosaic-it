<script lang="ts">
  import { onMount } from 'svelte';
  import Canvas from '../components/Canvas.svelte';
  import Controls from '../components/Controls.svelte';

  let droppedFile: HTMLImageElement;
  let fileUrl;
  let file;
  let isFileDropMode = true;

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

  function handleFileDrop(fileDropEvent) {
    file = fileDropEvent.files[0];
    if (fileUrl != undefined) {
      URL.revokeObjectURL(fileUrl);
    }
    fileUrl = URL.createObjectURL(file);
    isFileDropMode = false;
  }

  function drawImage() {
    canvasCmp.init(droppedFile);
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

<file-drop on:filedrop={handleFileDrop} accept="image/*" class:hide={!isFileDropMode}>
  {#if fileUrl == undefined}
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
  {:else}
    <img bind:this={droppedFile} alt="" src={fileUrl} on:load={drawImage} />
  {/if}
</file-drop>

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
    width: 100%;
    height: 100%;
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
