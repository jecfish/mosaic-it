<script lang="ts">
	import { onMount } from 'svelte';
	import { createWorker, Page } from 'tesseract.js';

	let canvas;
	let droppedFile: HTMLImageElement;
	let fileUrl;
	let file;
	let isFileDropMode = true;
	let ctx;
	const worker = createWorker();

	async function handleFileDrop(fileDropEvent) {
		file = fileDropEvent.files[0];
		if (fileUrl != undefined) {
			URL.revokeObjectURL(fileUrl);
		}
		fileUrl = URL.createObjectURL(file);
		isFileDropMode = false;

		await worker.load();
		await worker.loadLanguage('eng');
		await worker.initialize('eng');
		const { data } = await worker.recognize(file);

		textDetected(data);
	}

	function drawImage() {
		ctx = canvas.getContext('2d');
		canvas.width = droppedFile.width;
        canvas.height = droppedFile.height;
        ctx.drawImage(droppedFile, 0, 0, canvas.width, canvas.height);
	}

	function textDetected(data: Tesseract.Page) {
		ctx = canvas.getContext('2d');
console.log('Detected texts:', data.words);
		data.words.forEach(word => {
			if (word.confidence < 70.0) return;
			const { x0, y0, x1, y1 } = word.bbox;
			const width = x1 - x0;
			const height = y1 - y0;
			ctx.strokeStyle = 'red';
			ctx.lineWidth = 2;
			ctx.strokeRect(x0, y0, width, height);
			ctx.font = '16px serif';
			ctx.fillText(word.text, x0, y0);
		});
	}

	onMount(async () => {
		// https://kit.svelte.dev/faq#:~:text=How%20do%20I%20use%20a%20client%2Dside%20only%20library%20that%20depends%20on%20document%20or%20window%3F
		await import('file-drop-element');
		await import('pinch-zoom-element');

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
			font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
				Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
				sans-serif;
		}

		div#svelte {
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	</style>
</svelte:head>
<pinch-zoom class:hide={isFileDropMode}>
	<canvas bind:this={canvas} width={0} height={0}></canvas>
</pinch-zoom>

<file-drop on:filedrop={handleFileDrop} accept="image/*" class:hide={!isFileDropMode}>
	{#if fileUrl == undefined}
		<input id="file-picker" class="file-picker__input" type="file" accept="image/*" on:change={e => handleFileDrop(e.target)}>
		<label for="file-picker" class="file-picker__label">
			<h1>Drop or select an image to start auto mosaic.</h1>
			<svg viewBox="0 0 24 24" class="file-picker__icon">
				<path d="M19 7v3h-2V7h-3V5h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5a2 2 0 00-2 2v12c0 1.1.9 2 2 2h12a2 2 0 002-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z" />
			</svg>
		</label>
	{:else}
		<img bind:this={droppedFile} alt="" src={fileUrl} on:load={drawImage} />
	{/if}
</file-drop>

<style>
	canvas {
		margin:auto;
		padding:0;
		position:relative;
		display:block;
	}

	pinch-zoom {
		width: 100%;
		height: 100%;
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
