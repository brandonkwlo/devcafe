<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';

	let typedText = $state('');
	const fullText = 'Welcome to Dev Cafe!';

	onMount(() => {
		let i = 0;
		const typeWriter = () => {
			if (i < fullText.length) {
				typedText += fullText.charAt(i);
				i++;
				setTimeout(typeWriter, 80);
			}
		};

		setTimeout(typeWriter, 500);
	});

	let email = $state('');
	let isSubscribed = $state(false);

	const features = [
		{
			title: 'Knowledge Base',
			description: 'Curated programming resources and tutorials',
			icon: '📚'
		},
		{
			title: 'Community',
			description: 'Connect with fellow developers over coffee',
			icon: '👥'
		},
		{
			title: 'Cozy Space',
			description: 'A warm environment for productive coding',
			icon: '🏠'
		}
	];

	function handleSubscribe(event: SubmitEvent) {
		if (email) {
			isSubscribed = true;
		} else {
			event.preventDefault();
			alert('Subscription was prevented!');
		}
	}
</script>

<svelte:head>
	<title>DevCafe ☕ - Where Developers Gather</title>
	<meta name="description" content="A cozy knowledge base and community space for developers" />
</svelte:head>

<section class="hero">
	<div class="hero-content">
		<h1 class="typing-title">
			{typedText}<span class="cursor">|</span>
		</h1>
		<p class="hero-subtitle">
			Where developers gather to share knowledge, sip coffee, and build amazing things together.
		</p>
		<div class="hero-actions">
			<Button variant="primary" size="large">Start Brewing 🚀</Button>
			<Button variant="secondary" size="large">Explore Menu 📖</Button>
		</div>
	</div>
	<div class="hero-decoration">
		<div class="coffee-steam">☕️</div>
		<div class="coffee-beans">
			<span>☕</span>
			<span>☕</span>
			<span>☕</span>
		</div>
	</div>
</section>

<section class="features">
	<h2>What We Serve</h2>
	<div class="feature-grid">
		{#each features as feature}
			<div class="feature-card">
				<div class="feature-icon">{feature.icon}</div>
				<h3>{feature.title}</h3>
				<p>{feature.description}</p>
			</div>
		{/each}
	</div>
</section>

<section class="newsletter">
	<div class="newsletter-content">
		<h2>Stay in the Loop ☕️</h2>
		<p>Get the latest developer resources and community updates delivered to your inbox.</p>

		{#if !isSubscribed}
			<form onsubmit={handleSubscribe} class="newsletter-form">
				<div class="input-group">
					<input bind:value={email} type="email" placeholder="your@email.com" required />
					<Button type="submit" variant="primary">Join the Cafe</Button>
				</div>
			</form>
		{:else}
			<div class="success-message">
				<p>Welcome to the DevCafe family! ☕️✨</p>
				<p>Check your inbox for a warm welcome message.</p>
			</div>
		{/if}
	</div>
</section>

<style>
	.hero {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4rem 0;
		min-height: 60vh;
		position: relative;
	}

	.hero-content {
		flex: 1;
		max-width: 600px;
	}

	.typing-title {
		color: #8b4513;
		font-weight: 700;
		font-size: clamp(2rem, 5vw, 3.5rem);
		margin-bottom: 1.5rem;
		line-height: 1.2;
	}

	.cursor {
		animation: blink 1s infinite;
		color: #cd853f;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: #6b5b47;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.hero-decoration {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.coffee-steam {
		font-size: 4rem;
		animation: steam 3s ease-in-out infinite;
		margin-bottom: 2rem;
	}

	.coffee-beans {
		display: flex;
		gap: 1rem;
	}

	.coffee-beans span {
		font-size: 2rem;
		animation: float 2s ease-in-out infinite;
		animation-delay: calc(var(--i) * 0.3s);
	}

	.coffee-beans span:nth-child(1) {
		--i: 0;
	}
	.coffee-beans span:nth-child(2) {
		--i: 1;
	}
	.coffee-beans span:nth-child(3) {
		--i: 2;
	}

	@keyframes steam {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-10px) rotate(5deg);
		}
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.features {
		padding: 6rem 0;
		text-align: center;
	}

	.features h2 {
		color: #8b4513;
		font-size: 2.5rem;
		margin-bottom: 3rem;
		font-weight: 600;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.feature-card {
		background: rgba(255, 255, 255, 0.8);
		padding: 2.5rem 2rem;
		border-radius: 1rem;
		box-shadow: 0 4px 20px rgba(139, 69, 19, 0.1);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		border: 1px solid rgba(139, 69, 19, 0.1);
	}

	.feature-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 30px rgba(139, 69, 19, 0.15);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		color: #8b4513;
		font-size: 1.5rem;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.feature-card p {
		color: #6b5b47;
		line-height: 1.6;
	}

	.newsletter {
		background: linear-gradient(135deg, rgba(139, 69, 19, 0.05), rgba(160, 82, 45, 0.05));
		padding: 4rem 2rem;
		border-radius: 2rem;
		margin: 4rem 0;
		border: 1px solid rgba(139, 69, 19, 0.1);
	}

	.newsletter-content {
		max-width: 600px;
		margin: 0 auto;
		text-align: center;
	}

	.newsletter h2 {
		color: #8b4513;
		font-size: 2rem;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.newsletter p {
		color: #6b5b47;
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.newsletter-form {
		margin-top: 2rem;
	}

	.input-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.newsletter input {
		padding: 0.875rem 1.25rem;
		border: 2px solid rgba(139, 69, 19, 0.2);
		border-radius: 2rem;
		min-width: 300px;
		font-size: 1rem;
		background: rgba(255, 255, 255, 0.9);
		transition:
			border-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	.newsletter input:focus {
		outline: none;
		border-color: #8b4513;
		box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
	}

	.success-message {
		background: rgba(139, 69, 19, 0.1);
		padding: 2rem;
		border-radius: 1rem;
		border: 1px solid rgba(139, 69, 19, 0.2);
	}

	.success-message p {
		margin: 0.5rem 0;
		color: #8b4513;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.hero {
			flex-direction: column;
			text-align: center;
			padding: 2rem 0;
		}

		.hero-decoration {
			margin-top: 2rem;
		}

		.hero-actions {
			justify-content: center;
		}

		.input-group {
			flex-direction: column;
			align-items: center;
		}

		.newsletter input {
			min-width: 280px;
		}
	}
</style>
