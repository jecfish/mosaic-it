<script>
	import { onMount } from 'svelte';
import { toggle_class } from 'svelte/internal';

	export let file;
	export let fileUrl;

	let shareElement;
	let downloadElement;

	const reload = () => (window.location = window.location);
	const share = () => navigator.share({ files: [file] });

	const disable = (element) => element.setAttribute("enabled", false);
	const enable = (element) => element.setAttribute("enabled", true);

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

<style>
a[enabled=false] {
    display: none;
}
a[enabled=true] {
    display: initial;
}

</style>
<a id="refresh" on:click={reload}><img src="images/refresh_black_24dp.svg" /></a>
<a id="download" download enabled={hasFile} href={fileUrl} bind:this={downloadElement}
	><img src="images/download_black_24dp.svg" /></a
>
<a id="share" enabled={hasFile} bind:this={shareElement} on:click={share}><img src="images/share_black_24dp.svg" /></a
>
