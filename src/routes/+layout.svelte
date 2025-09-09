<script>
	import Navigation from '$lib/components/Navigation.svelte';
	import '../app.css';
</script>

<Navigation />

<main>
	<slot />
</main>

<footer>
	<div class="footer-content">
		<p>&copy; 2025 DevCafe. Brewing knowledge, one cup at a time ☕️</p>
		<div class="footer-links">
			<a href="/about">About</a>
			<a href="/contact">Contact</a>
			<a href="/privacy">Privacy</a>
		</div>
	</div>
</footer>

<style>
	:global(body) {
		background: linear-gradient(135deg, #fefdf8 0%, #f5f3ed 100%);
		color: #4a4a4a;
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		line-height: 1.6;
	}

	main {
		min-height: calc(100vh - 140px);
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	footer {
		background: linear-gradient(135deg, #8b4513, #a0522d);
		color: #fefdf8;
		padding: 2rem;
		margin-top: 4rem;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.footer-links {
		display: flex;
		gap: 2rem;
	}

	.footer-links a {
		color: #fefdf8;
		text-decoration: none;
		opacity: 0.8;
		transition: opacity 0.2s ease;
	}

	.footer-links a:hover {
		opacity: 1;
	}

	@media (max-width: 768px) {
		main {
			padding: 1rem;
		}

		.footer-content {
			flex-direction: column;
			text-align: center;
		}

		.footer-links {
			justify-content: center;
		}
	}
</style>
