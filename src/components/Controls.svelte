<script>
  import { onMount } from 'svelte';

  export let file;
  export let fileUrl;
  export let onDownloadHandler = async (event) => {
    console.log(event);
  };

  let shareElement;
  let downloadElement;
  let dummyDownloadElement;

  const reload = () => (window.location = window.location);
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

  const disable = (element) => element.setAttribute('enabled', false);
  const enable = (element) => element.setAttribute('enabled', true);

  $: hasFile = fileUrl != undefined;

  onMount(() => {
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

<a id="refresh" on:click={reload}>
  <img src="images/refresh_black_24dp.svg" alt="Refresh" />
</a>
<a id="download" enabled={hasFile} href={fileUrl} bind:this={downloadElement} on:click={onDownload}>
  <img src="images/download_black_24dp.svg" alt="Download" />
</a>
<a id="share" enabled={hasFile} bind:this={shareElement} on:click={share}>
  <img src="images/share_black_24dp.svg" alt="Share" />
</a>
<a id="dummyDownload" bind:this={dummyDownloadElement} download />

<style>
  a[enabled='false'] {
    display: none;
  }
  a[enabled='true'] {
    display: initial;
  }
</style>
