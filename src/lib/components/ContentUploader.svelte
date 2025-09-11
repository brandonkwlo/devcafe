<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';

	const dispatch = createEventDispatcher();

	let dragActive = $state(false);
	let uploading = $state(false);
	let youtubeUrl = $state('');
	let activeUploadType = $state('file');
	let fileInput: HTMLInputElement;

	const uploadTypes = [
		{ id: 'file', label: 'Files', icon: '📁', description: 'PDFs, text files, documents' },
		{ id: 'youtube', label: 'YouTube', icon: '📺', description: 'YouTube video URLs' },
		{ id: 'text', label: 'Text', icon: '📝', description: 'Direct text input' },
		{ id: 'url', label: 'Web URL', icon: '🌐', description: 'Articles and web pages' }
	];

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;

		const files = Array.from(event.dataTransfer?.files || []);
		if (files.length > 0) {
			await processFiles(files);
		}
	}

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = Array.from(target.files || []);
		if (files.length > 0) {
			await processFiles(files);
		}
	}

	async function processFiles(files: File[]) {
		uploading = true;

		for (const file of files) {
			try {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('type', 'file');

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData
				});

				if (response.ok) {
					const result = await response.json();
					dispatch('contentUploaded', {
						type: 'FILE',
						name: file.name,
						size: formatFileSize(file.size),
						content: result.content,
						id: result.id
					});
				}
			} catch (error) {
				console.error('File upload failed:', error);
			}
		}

		uploading = false;
	}

	async function handleYouTubeUpload() {
		if (!youtubeUrl.trim()) return;

		uploading = true;

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: 'youtube',
					url: youtubeUrl
				})
			});

			if (response.ok) {
				const result = await response.json();
				dispatch('contentUploaded', {
					type: 'YOUTUBE',
					name: result.title || 'YouTube Video',
					size: result.duration || 'N/A',
					content: result.transcript,
					url: youtubeUrl,
					id: result.id
				});
				youtubeUrl = '';
			}
		} catch (error) {
			console.error('YouTube upload failed:', error);
		}

		uploading = false;
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function isValidYouTubeUrl(url: string): boolean {
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
		return youtubeRegex.test(url);
	}
</script>

<div class="content-uploader">
	<div class="upload-type-selector">
		{#each uploadTypes as type}
			<button
				class="upload-type-button"
				class:active={activeUploadType === type.id}
				onclick={() => (activeUploadType = type.id)}
			>
				<span class="type-icon">{type.icon}</span>
				<div class="type-info">
					<span class="type-label">{type.label}</span>
					<span class="type-description">{type.description}</span>
				</div>
			</button>
		{/each}
	</div>

	<div class="upload-area">
		{#if activeUploadType === 'file'}
			<div
				class="file-drop-zone"
				class:drag-active={dragActive}
				class:uploading
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
			>
				<div class="drop-zone-content">
					{#if uploading}
						<div class="upload-spinner">⏳</div>
						<p>Processing files...</p>
					{:else}
						<div class="drop-zone-icon">📁</div>
						<h3>Drop files here or click to browse</h3>
						<p>Supports PDF, TXT, DOCX, and more</p>
						<input
							type="file"
							multiple
							accept=".pdf,.txt,.docx,.doc,.md"
							onchange={handleFileSelect}
							style="display: none;"
							bind:this={fileInput}
						/>
						<Button onclick={() => fileInput?.click()} variant="secondary">Choose Files</Button>
					{/if}
				</div>
			</div>
		{:else if activeUploadType === 'youtube'}
			<div class="youtube-uploader">
				<div class="youtube-input-group">
					<input
						bind:value={youtubeUrl}
						type="url"
						placeholder="https://www.youtube.com/watch?v=..."
						class="youtube-input"
						class:invalid={youtubeUrl && !isValidYouTubeUrl(youtubeUrl)}
					/>
					<Button
						onclick={handleYouTubeUpload}
						variant="primary"
						disabled={!youtubeUrl || !isValidYouTubeUrl(youtubeUrl) || uploading}
					>
						{#if uploading}
							Processing... ⏳
						{:else}
							Add Video 📺
						{/if}
					</Button>
				</div>
				<div class="youtube-help">
					<p>📝 We'll extract the transcript and key information from the video</p>
					<p>⚡ Supports YouTube videos with available captions</p>
				</div>
			</div>
		{:else if activeUploadType === 'text'}
			<div class="text-uploader">
				<textarea placeholder="Paste your text content here..." class="text-input" rows="10"
				></textarea>
				<div class="text-actions">
					<Button variant="primary">Add Text Content</Button>
				</div>
			</div>
		{:else if activeUploadType === 'url'}
			<div class="url-uploader">
				<div class="url-input-group">
					<input type="url" placeholder="https://example.com/article" class="url-input" />
					<Button variant="primary">Extract Content</Button>
				</div>
				<div class="url-help">
					<p>📄 We'll extract the main content from articles and blog posts</p>
					<p>🔍 Works with most news sites and documentation</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.content-uploader {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.upload-type-selector {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.upload-type-button {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 2px solid rgba(139, 69, 19, 0.2);
		border-radius: 0.5rem;
		background: white;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.upload-type-button:hover {
		border-color: rgba(139, 69, 19, 0.4);
		transform: translateY(-2px);
	}

	.upload-type-button.active {
		border-color: #8b4513;
		background: rgba(139, 69, 19, 0.05);
	}

	.type-icon {
		font-size: 2rem;
	}

	.type-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.type-label {
		font-weight: 600;
		color: #8b4513;
		font-size: 1.1rem;
	}

	.type-description {
		font-size: 0.875rem;
		color: #6b5b47;
	}

	.upload-area {
		min-height: 300px;
	}

	.file-drop-zone {
		border: 3px dashed rgba(139, 69, 19, 0.3);
		border-radius: 1rem;
		padding: 3rem 2rem;
		text-align: center;
		transition: all 0.3s ease;
		background: rgba(255, 255, 255, 0.5);
	}

	.file-drop-zone.drag-active {
		border-color: #8b4513;
		background: rgba(139, 69, 19, 0.05);
		transform: scale(1.02);
	}

	.file-drop-zone.uploading {
		border-color: #cd853f;
		background: rgba(205, 133, 63, 0.05);
	}

	.drop-zone-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.drop-zone-icon {
		font-size: 4rem;
		opacity: 0.7;
	}

	.upload-spinner {
		font-size: 3rem;
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.drop-zone-content h3 {
		color: #8b4513;
		margin: 0;
		font-size: 1.5rem;
	}

	.drop-zone-content p {
		color: #6b5b47;
		margin: 0;
	}

	.youtube-uploader,
	.url-uploader {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
		border: 2px solid rgba(139, 69, 19, 0.2);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.8);
	}

	.youtube-input-group,
	.url-input-group {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.youtube-input,
	.url-input {
		flex: 1;
		padding: 0.875rem 1.25rem;
		border: 2px solid rgba(139, 69, 19, 0.2);
		border-radius: 2rem;
		font-size: 1rem;
		transition: border-color 0.3s ease;
	}

	.youtube-input:focus,
	.url-input:focus {
		outline: none;
		border-color: #8b4513;
	}

	.youtube-input.invalid {
		border-color: #dc2626;
	}

	.youtube-help,
	.url-help {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.youtube-help p,
	.url-help p {
		color: #6b5b47;
		font-size: 0.9rem;
		margin: 0;
	}

	.text-uploader {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 2rem;
		border: 2px solid rgba(139, 69, 19, 0.2);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.8);
	}

	.text-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid rgba(139, 69, 19, 0.2);
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 1rem;
		resize: vertical;
		min-height: 200px;
	}

	.text-input:focus {
		outline: none;
		border-color: #8b4513;
	}

	.text-actions {
		display: flex;
		justify-content: flex-end;
	}

	@media (max-width: 768px) {
		.upload-type-selector {
			grid-template-columns: 1fr;
		}

		.youtube-input-group,
		.url-input-group {
			flex-direction: column;
			align-items: stretch;
		}

		.file-drop-zone {
			padding: 2rem 1rem;
		}
	}
</style>
