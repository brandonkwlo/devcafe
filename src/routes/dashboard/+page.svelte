<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import ContentUploader from '$lib/components/ContentUploader.svelte';
	import AnalysisResults from '$lib/components/AnalysisResults.svelte';

	let activeTab = $state('upload');
	let uploadedContent = $state([]);
	let analysisResults = $state([]);
	let isAnalyzing = $state(false);

	const tabs = [
		{ id: 'upload', label: 'Upload Content', icon: '📤' },
		{ id: 'analyze', label: 'AI Analysis', icon: '🤖' },
		{ id: 'results', label: 'Results', icon: '📊' }
	];

	function handleContentUploaded(event) {
		const newContent = event.detail;
		uploadedContent = [...uploadedContent, newContent];

		// Auto-switch to analyze tab after upload
		setTimeout(() => {
			activeTab = 'analyze';
		}, 1000);
	}

	function handleAnalysisComplete(event) {
		const result = event.detail;
		analysisResults = [...analysisResults, result];
		activeTab = 'results';
		isAnalyzing = false;
	}

	async function startAnalysis() {
		if (uploadedContent.length === 0) return;

		isAnalyzing = true;

		try {
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: uploadedContent })
			});

			const result = await response.json();
			handleAnalysisComplete({ detail: result });
		} catch (error) {
			console.error('Analysis failed:', error);
			isAnalyzing = false;
		}
	}
</script>

<svelte:head>
	<title>Dashboard - DevCafe ☕</title>
	<meta name="description" content="Upload and analyze your content with AI" />
</svelte:head>

<div class="dashboard">
	<header class="dashboard-header">
		<h1>Content Analysis Dashboard ☕️</h1>
		<p>Upload your content and let AI brew some insights for you</p>
	</header>

	<nav class="tab-navigation">
		{#each tabs as tab}
			<button
				class="tab-button"
				class:active={activeTab === tab.id}
				onclick={() => (activeTab = tab.id)}
			>
				<span class="tab-icon">{tab.icon}</span>
				<span class="tab-label">{tab.label}</span>
				{#if tab.id === 'upload' && uploadedContent.length > 0}
					<span class="badge">{uploadedContent.length}</span>
				{/if}
				{#if tab.id === 'results' && analysisResults.length > 0}
					<span class="badge">{analysisResults.length}</span>
				{/if}
			</button>
		{/each}
	</nav>

	<main class="dashboard-content">
		{#if activeTab === 'upload'}
			<div class="tab-panel">
				<h2>Upload Your Content</h2>
				<p>Support for YouTube URLs, PDFs, text files, and more</p>
				<ContentUploader on:contentUploaded={handleContentUploaded} />

				{#if uploadedContent.length > 0}
					<div class="uploaded-items">
						<h3>Uploaded Content ({uploadedContent.length})</h3>
						<div class="content-list">
							{#each uploadedContent as item, index}
								<div class="content-item">
									<span class="content-type">{item.type}</span>
									<span class="content-name">{item.name}</span>
									<span class="content-size">{item.size || 'N/A'}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{:else if activeTab === 'analyze'}
			<div class="tab-panel">
				<h2>AI Analysis</h2>
				<p>Generate insights, summaries, and learning plans from your content</p>

				{#if uploadedContent.length === 0}
					<div class="empty-state">
						<p>No content uploaded yet. Go to the Upload tab to add some content first.</p>
						<Button onclick={() => (activeTab = 'upload')} variant="secondary">
							Upload Content
						</Button>
					</div>
				{:else}
					<div class="analysis-options">
						<div class="analysis-types">
							<h3>Analysis Options</h3>
							<div class="option-grid">
								<div class="analysis-option">
									<h4>📝 Summary</h4>
									<p>Generate concise summaries of your content</p>
								</div>
								<div class="analysis-option">
									<h4>🎯 Learning Plan</h4>
									<p>Create structured learning paths</p>
								</div>
								<div class="analysis-option">
									<h4>💡 Key Insights</h4>
									<p>Extract important concepts and ideas</p>
								</div>
								<div class="analysis-option">
									<h4>❓ Q&A Generation</h4>
									<p>Generate questions for better understanding</p>
								</div>
							</div>
						</div>

						<div class="analysis-actions">
							<Button onclick={startAnalysis} variant="primary" size="large" disabled={isAnalyzing}>
								{#if isAnalyzing}
									Analyzing... ⏳
								{:else}
									Start Analysis 🚀
								{/if}
							</Button>
						</div>
					</div>
				{/if}
			</div>
		{:else if activeTab === 'results'}
			<div class="tab-panel">
				<h2>Analysis Results</h2>
				<p>Your AI-generated insights and learning materials</p>

				{#if analysisResults.length === 0}
					<div class="empty-state">
						<p>No analysis results yet. Upload content and run analysis to see results here.</p>
					</div>
				{:else}
					<AnalysisResults results={analysisResults} />
				{/if}
			</div>
		{/if}
	</main>
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.dashboard-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.dashboard-header h1 {
		color: #8b4513;
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		font-weight: 700;
	}

	.dashboard-header p {
		color: #6b5b47;
		font-size: 1.1rem;
	}

	.tab-navigation {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		border-bottom: 2px solid rgba(139, 69, 19, 0.1);
	}

	.tab-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border: none;
		background: transparent;
		color: #6b5b47;
		cursor: pointer;
		border-radius: 0.5rem 0.5rem 0 0;
		transition: all 0.3s ease;
		position: relative;
	}

	.tab-button:hover {
		background: rgba(139, 69, 19, 0.05);
		color: #8b4513;
	}

	.tab-button.active {
		background: rgba(139, 69, 19, 0.1);
		color: #8b4513;
		font-weight: 600;
		border-bottom: 3px solid #8b4513;
	}

	.tab-icon {
		font-size: 1.2rem;
	}

	.badge {
		background: #8b4513;
		color: white;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: bold;
	}

	.dashboard-content {
		background: rgba(255, 255, 255, 0.8);
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(139, 69, 19, 0.1);
		border: 1px solid rgba(139, 69, 19, 0.1);
	}

	.tab-panel h2 {
		color: #8b4513;
		margin-bottom: 0.5rem;
		font-size: 1.8rem;
	}

	.tab-panel p {
		color: #6b5b47;
		margin-bottom: 2rem;
	}

	.uploaded-items {
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgba(139, 69, 19, 0.05);
		border-radius: 0.5rem;
		border: 1px solid rgba(139, 69, 19, 0.1);
	}

	.uploaded-items h3 {
		color: #8b4513;
		margin-bottom: 1rem;
	}

	.content-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.content-item {
		display: grid;
		grid-template-columns: 100px 1fr auto;
		gap: 1rem;
		padding: 0.75rem;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid rgba(139, 69, 19, 0.1);
	}

	.content-type {
		font-weight: 600;
		color: #8b4513;
		text-transform: uppercase;
		font-size: 0.875rem;
	}

	.content-name {
		color: #4a4a4a;
	}

	.content-size {
		color: #6b5b47;
		font-size: 0.875rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6b5b47;
	}

	.empty-state p {
		margin-bottom: 1.5rem;
	}

	.analysis-options {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.option-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.analysis-option {
		padding: 1.5rem;
		background: rgba(139, 69, 19, 0.05);
		border-radius: 0.5rem;
		border: 1px solid rgba(139, 69, 19, 0.1);
		transition: transform 0.2s ease;
	}

	.analysis-option:hover {
		transform: translateY(-2px);
	}

	.analysis-option h4 {
		color: #8b4513;
		margin-bottom: 0.5rem;
		font-size: 1.1rem;
	}

	.analysis-option p {
		color: #6b5b47;
		font-size: 0.9rem;
		margin: 0;
	}

	.analysis-actions {
		text-align: center;
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: 1rem;
		}

		.tab-navigation {
			flex-wrap: wrap;
		}

		.tab-button {
			flex: 1;
			min-width: 120px;
		}

		.content-item {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.option-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
