<script lang="ts">
	import Button from './Button.svelte';

	let { results = [] } = $props();

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getAnalysisTypeIcon(type: string): string {
		const icons = {
			summary: '📝',
			learning_plan: '🎯',
			insights: '💡',
			qa: '❓',
			default: '📊'
		};
		return icons[type] || icons.default;
	}

	function exportResult(result: any) {
		const content = `# ${result.title}\n\n${result.content}`;
		const blob = new Blob([content], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function saveToRedis(result: any) {
		try {
			const response = await fetch('/api/save-result', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(result)
			});

			if (response.ok) {
				alert('Result saved successfully! ✅');
			}
		} catch (error) {
			console.error('Failed to save result:', error);
			alert('Failed to save result ❌');
		}
	}
</script>

<div class="analysis-results">
	{#if results.length === 0}
		<div class="empty-results">
			<div class="empty-icon">📊</div>
			<h3>No Results Yet</h3>
			<p>Upload some content and run analysis to see results here.</p>
		</div>
	{:else}
		<div class="results-header">
			<h3>Analysis Results ({results.length})</h3>
			<div class="results-actions">
				<Button variant="secondary" size="small">Export All 📤</Button>
			</div>
		</div>

		<div class="results-grid">
			{#each results as result, index}
				<div class="result-card">
					<div class="result-header">
						<div class="result-meta">
							<span class="result-type">
								{getAnalysisTypeIcon(result.type)}
								{result.type?.replace('_', ' ').toUpperCase() || 'ANALYSIS'}
							</span>
							<span class="result-date">
								{formatDate(result.createdAt)}
							</span>
						</div>
						<div class="result-actions">
							<button
								class="action-button"
								onclick={() => saveToRedis(result)}
								title="Save to Redis"
							>
								💾
							</button>
							<button
								class="action-button"
								onclick={() => exportResult(result)}
								title="Export as Markdown"
							>
								📤
							</button>
						</div>
					</div>

					<div class="result-content">
						<h4 class="result-title">{result.title}</h4>

						{#if result.summary}
							<div class="result-summary">
								<strong>Summary:</strong>
								<p>{result.summary}</p>
							</div>
						{/if}

						{#if result.keyPoints && result.keyPoints.length > 0}
							<div class="key-points">
								<strong>Key Points:</strong>
								<ul>
									{#each result.keyPoints as point}
										<li>{point}</li>
									{/each}
								</ul>
							</div>
						{/if}

						{#if result.learningPlan && result.learningPlan.length > 0}
							<div class="learning-plan">
								<strong>Learning Plan:</strong>
								<ol class="plan-steps">
									{#each result.learningPlan as step}
										<li class="plan-step">
											<h5>{step.title}</h5>
											<p>{step.description}</p>
											{#if step.duration}
												<span class="step-duration">⏱️ {step.duration}</span>
											{/if}
										</li>
									{/each}
								</ol>
							</div>
						{/if}

						{#if result.questions && result.questions.length > 0}
							<div class="questions">
								<strong>Generated Questions:</strong>
								<div class="question-list">
									{#each result.questions as qa}
										<details class="question-item">
											<summary class="question">{qa.question}</summary>
											<div class="answer">{qa.answer}</div>
										</details>
									{/each}
								</div>
							</div>
						{/if}

						{#if result.insights && result.insights.length > 0}
							<div class="insights">
								<strong>Key Insights:</strong>
								<div class="insights-grid">
									{#each result.insights as insight}
										<div class="insight-card">
											<div class="insight-icon">💡</div>
											<div class="insight-content">
												<h6>{insight.title}</h6>
												<p>{insight.description}</p>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<div class="result-footer">
						<div class="source-info">
							<span class="source-label">Source:</span>
							<span class="source-name">{result.sourceName || 'Unknown'}</span>
						</div>
						<div class="confidence-score">
							{#if result.confidence}
								<span class="confidence-label">Confidence:</span>
								<div class="confidence-bar">
									<div class="confidence-fill" style="width: {result.confidence}%"></div>
								</div>
								<span class="confidence-value">{result.confidence}%</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.analysis-results {
		width: 100%;
	}

	.empty-results {
		text-align: center;
		padding: 4rem 2rem;
		color: #6b5b47;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.empty-results h3 {
		color: #8b4513;
		margin-bottom: 0.5rem;
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid rgba(139, 69, 19, 0.1);
	}

	.results-header h3 {
		color: #8b4513;
		margin: 0;
		font-size: 1.5rem;
	}

	.results-grid {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.result-card {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(139, 69, 19, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 4px 12px rgba(139, 69, 19, 0.1);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.result-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(139, 69, 19, 0.15);
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.result-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.result-type {
		font-weight: 600;
		color: #8b4513;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.result-date {
		font-size: 0.75rem;
		color: #6b5b47;
	}

	.result-actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-button {
		background: none;
		border: 1px solid rgba(139, 69, 19, 0.3);
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s ease;
	}

	.action-button:hover {
		background: rgba(139, 69, 19, 0.1);
		border-color: #8b4513;
	}

	.result-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.result-title {
		color: #8b4513;
		font-size: 1.25rem;
		margin: 0;
		font-weight: 600;
	}

	.result-summary p,
	.key-points,
	.learning-plan,
	.questions,
	.insights {
		margin-top: 0.5rem;
	}

	.key-points ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.key-points li {
		margin-bottom: 0.25rem;
		color: #4a4a4a;
	}

	.plan-steps {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.plan-step {
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: rgba(139, 69, 19, 0.05);
		border-radius: 0.5rem;
		border-left: 3px solid #8b4513;
	}

	.plan-step h5 {
		color: #8b4513;
		margin: 0 0 0.25rem 0;
		font-size: 1rem;
	}

	.plan-step p {
		margin: 0;
		color: #4a4a4a;
		font-size: 0.9rem;
	}

	.step-duration {
		display: inline-block;
		margin-top: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: rgba(139, 69, 19, 0.1);
		border-radius: 1rem;
		font-size: 0.75rem;
		color: #8b4513;
		font-weight: 500;
	}

	.question-list {
		margin-top: 0.5rem;
	}

	.question-item {
		margin-bottom: 0.5rem;
		border: 1px solid rgba(139, 69, 19, 0.2);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.question {
		padding: 0.75rem;
		background: rgba(139, 69, 19, 0.05);
		cursor: pointer;
		font-weight: 500;
		color: #8b4513;
	}

	.question:hover {
		background: rgba(139, 69, 19, 0.1);
	}

	.answer {
		padding: 0.75rem;
		color: #4a4a4a;
		background: white;
	}

	.insights-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.insight-card {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		background: rgba(139, 69, 19, 0.05);
		border-radius: 0.5rem;
		border: 1px solid rgba(139, 69, 19, 0.1);
	}

	.insight-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.insight-content h6 {
		color: #8b4513;
		margin: 0 0 0.25rem 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.insight-content p {
		margin: 0;
		color: #4a4a4a;
		font-size: 0.85rem;
	}

	.result-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(139, 69, 19, 0.1);
		font-size: 0.875rem;
	}

	.source-info {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.source-label {
		color: #6b5b47;
		font-weight: 500;
	}

	.source-name {
		color: #8b4513;
		font-weight: 600;
	}

	.confidence-score {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.confidence-label {
		color: #6b5b47;
		font-weight: 500;
	}

	.confidence-bar {
		width: 60px;
		height: 8px;
		background: rgba(139, 69, 19, 0.2);
		border-radius: 4px;
		overflow: hidden;
	}

	.confidence-fill {
		height: 100%;
		background: linear-gradient(90deg, #8b4513, #cd853f);
		transition: width 0.3s ease;
	}

	.confidence-value {
		color: #8b4513;
		font-weight: 600;
		font-size: 0.75rem;
	}

	@media (max-width: 768px) {
		.results-header {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.result-header {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.result-footer {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.insights-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
