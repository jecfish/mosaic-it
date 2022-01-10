<svelte:head>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      position: relative;
      width: 100%;
      height: 100%;
    }

    div#svelte {
      height:100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  </style>
</svelte:head>

<script>
  import 'file-drop-element';
  import { onMount } from 'svelte';

  let dropTarget;
  let droppedFile;
  let fileUrl;

  onMount(() => {
    dropTarget.addEventListener('filedrop', (fileDropEvent) => {
      let file = fileDropEvent.files[0];
      if (fileUrl != undefined) {
        URL.revokeObjectURL(fileUrl);
      }
      fileUrl = URL.createObjectURL(file);
    });
  });
</script>
<style>
  file-drop {
    height: 80vh;
    width: 80vw;
    border-radius: 10px;
    box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
    
  :global(file-drop.drop-valid) {
    background-color: green;
  }
  
  :global(file-drop.drop-invalid) {
    background-color: red;
  }
</style>

<h1>Welcome to Auto Mosaic.</h1>
<file-drop bind:this={dropTarget} accept="image/*">
{#if fileUrl == undefined}
  <p>Drop an image file here to auto-mosasic.</p>
{:else}
    <img bind:this={droppedFile} src={fileUrl}>
{/if}
</file-drop>
