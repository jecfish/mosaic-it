<script lang="ts">
	import { onMount } from 'svelte';

	let dropTarget;
	let droppedFile;
	let fileUrl;
	let file;

	onMount(async () => {
		// https://kit.svelte.dev/faq#:~:text=How%20do%20I%20use%20a%20client%2Dside%20only%20library%20that%20depends%20on%20document%20or%20window%3F
		await import('file-drop-element');
		dropTarget.addEventListener('filedrop', (fileDropEvent) => {
			file = fileDropEvent.files[0];
			if (fileUrl != undefined) {
				URL.revokeObjectURL(fileUrl);
			}
			fileUrl = URL.createObjectURL(file);
		});
	});
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
		}

		div#svelte {
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	</style>
</svelte:head>

<h1>Welcome to Auto Mosaic.</h1>
<file-drop bind:this={dropTarget} accept="image/*">
	{#if fileUrl == undefined}
		<p>Drop an image file here to auto-mosasic.</p>
	{:else}
		<img bind:this={droppedFile} alt="" src={fileUrl} />
	{/if}
</file-drop>

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
