<script lang="ts">
	import { onMount } from 'svelte';
	import AnalysisResults from '$lib/components/AnalysisResults.svelte';
	import Button from '$lib/components/Button.svelte';

	let savedResults = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const response = await fetch('/api/save-result');
			if (response.ok) {
				const data = await response.json();
				savedResults = data.results || [];
			} else {
				error = 'Failed to load saved results';
			}
		} catch (err) {
			error = 'Error loading saved results';
			console.error(err);
		} finally {
			loading = false;
		}
	});

	async function clearAllSaved() {
		if (confirm('Are you sure you want to clear all saved results? This cannot be undone.')) {
			// Implementation would go here
			alert('Clear all functionality not implemented yet');
		}
	}
</script>

<svelte:head>
	<title>Saved Results - DevCafe ☕</title>
	<meta name="description" content="Your saved analysis results" />
</svelte:head>

<div class="saved-page">
	<header class="page-header">
		<div class="header-content">
			<h1>Saved Analysis Results ☕️</h1>
			<p>Your collection of AI-generated insights and learning materials</p>
		</div>
		<div class="header-actions">
			<a href="/dashboard">
				<Button variant="secondary">Back to Dashboard</Button>
			</a>
			{#if savedResults.length > 0}
				<Button variant="primary" onclick={clearAllSaved}>Clear All 🗑️</Button>
			{/if}
		</div>
	</header>

	<main class="page-content">
		{#if loading}
			<div class="loading-state">
				<div class="loading-spinner">⏳</div>
				<p>Loading your saved results...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<div class="error-icon">❌</div>
				<h3>Error Loading Results</h3>
				<p>{error}</p>
				<Button onclick={() => window.location.reload()}>Try Again</Button>
			</div>
		{:else if savedResults.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📊</div>
				<h3>No Saved Results Yet</h3>
				<p>Start analyzing content and save your results to see them here.</p>
				<a href="/dashboard">
					<Button variant="primary">Start Analyzing</Button>
				</a>
			</div>
		{:else}
			<div class="results-section">
				<div class="results-stats">
					<div class="stat-card">
						<span class="stat-number">{savedResults.length}</span>
						<span class="stat-label">Saved Results</span>
					</div>
					<div class="stat-card">
						<span class="stat-number">
							{savedResults.filter((r) => r.type === 'comprehensive').length}
						</span>
						<span class="stat-label">Comprehensive Analyses</span>
					</div>
					<div class="stat-card">
						<span class="stat-number">
							{new Set(savedResults.map((r) => r.sourceName)).size}
						</span>
						<span class="stat-label">Unique Sources</span>
					</div>
				</div>

				<AnalysisResults results={savedResults} />
			</div>
		{/if}
	</main>
</div>

<style>
	.saved-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid rgba(139, 69, 19, 0.1);
	}

	.header-content h1 {
		color: #8b4513;
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		font-weight: 700;
	}

	.header-content p {
		color: #6b5b47;
		font-size: 1.1rem;
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.header-actions a {
		text-decoration: none;
	}

	.loading-state,
	.error-state,
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: #6b5b47;
	}

	.loading-spinner,
	.error-icon,
	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.7;
	}

	.loading-spinner {
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

	.error-state h3,
	.empty-state h3 {
		color: #8b4513;
		margin-bottom: 0.5rem;
		font-size: 1.5rem;
	}

	.error-state p,
	.empty-state p {
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.empty-state a {
		text-decoration: none;
	}

	.results-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.results-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(139, 69, 19, 0.2);
		border-radius: 1rem;
		box-shadow: 0 4px 12px rgba(139, 69, 19, 0.1);
	}

	.stat-number {
		font-size: 2.5rem;
		font-weight: 700;
		color: #8b4513;
		line-height: 1;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #6b5b47;
		text-align: center;
		margin-top: 0.5rem;
	}

	@media (max-width: 768px) {
		.saved-page {
			padding: 1rem;
		}

		.page-header {
			flex-direction: column;
			gap: 2rem;
			align-items: flex-start;
		}

		.header-actions {
			width: 100%;
			justify-content: space-between;
		}

		.results-stats {
			grid-template-columns: 1fr;
		}
	}
</style>
