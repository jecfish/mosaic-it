<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';

  export let file;
  export let fileUrl;
  export let mask = false;
  export let onDownloadHandler = async (event) => {
    console.log(event);
  };

  let shareElement;
  let downloadElement;
  let dummyDownloadElement;
  let visibility = 'visibility_off';

  const dispatch = createEventDispatcher();

  let reload;
  const share = () => navigator.share({ files: [file] });
  const onDownload = async (clickEvent) => {
    clickEvent.preventDefault();
    const newFile = await onDownloadHandler(clickEvent);
    if (dummyDownloadElement.href != '') {
      URL.revokeObjectURL(dummyDownloadElement.href);
    }
    dummyDownloadElement.download = newFile.name;
    dummyDownloadElement.href = URL.createObjectURL(newFile);
    dummyDownloadElement.click();
  };
  const toggleHide = () => {
    mask = !mask;
    visibility = mask ? 'visibility_off' : 'visibility';
    dispatch('toggleMask');
  };

  const disable = (element) => element.setAttribute('enabled', false);
  const enable = (element) => element.setAttribute('enabled', true);

  $: hasFile = fileUrl != undefined;

  onMount(async () => {
    await import('@material/mwc-fab');
    await import('@material/mwc-icon');

    reload = () => (window.location = window.location);

    const nullTarget = { files: [new File([], 'test.png', { type: 'image/png' })] };
    if (fileUrl == undefined) {
      disable(downloadElement);
      disable(shareElement);
    }

    if ('canShare' in navigator == false) {
      disable(shareElement);
    } else {
      if (navigator.canShare(nullTarget) == false) {
        disable(shareElement);
      }
    }
  });
</script>

<mwc-fab enabled={hasFile} on:click={toggleHide}>
  <mwc-icon slot="icon">{visibility}</mwc-icon>
</mwc-fab>
<mwc-fab on:click={reload}>
  <mwc-icon id="refresh" slot="icon">refresh</mwc-icon>
</mwc-fab>
<mwc-fab enabled={hasFile} on:click={onDownload} href={fileUrl} bind:this={downloadElement}>
  <mwc-icon id="download" slot="icon">file_download</mwc-icon>
</mwc-fab>
<mwc-fab enabled={hasFile} bind:this={shareElement} on:click={share}>
  <mwc-icon id="share" slot="icon">share</mwc-icon>
</mwc-fab>
<a id="dummyDownload" bind:this={dummyDownloadElement} download style="display:none;">dummy</a>

<style>
  mwc-fab {
    z-index: 2;
  }
  mwc-fab[enabled='false'] {
    display: none;
  }
  mwc-fab[enabled='true'] {
    display: initial;
  }
</style>
