<!-- src/lib/components/Navigation.svelte -->
<script>
	import { page } from '$app/stores';
	import Button from './Button.svelte';

	let isMenuOpen = $state(false);

	const navItems = [
		{ href: '/saved', label: 'Saved', type: 'secondary' },
		{ href: '/dashboard', label: 'Dashboard', type: 'primary' }
	];

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}
</script>

<nav class="navbar">
	<div class="nav-brand">
		<a href="/" onclick={closeMenu}>
			<span class="logo">DevCafe</span>
			<span class="logo-icon">☕️</span>
		</a>
	</div>

	<button class="menu-toggle" onclick={toggleMenu} aria-label="Toggle menu">
		<span class="hamburger" class:open={isMenuOpen}></span>
	</button>

	<div class="nav-actions" class:open={isMenuOpen}>
		{#each navItems as item}
			<Button variant={item.type} size="small" onclick={closeMenu}>
				<a href={item.href} class="nav-button-link">
					{item.label}
				</a>
			</Button>
		{/each}
	</div>
</nav>

<style>
	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: #fefdf8;
		border-bottom: 1px solid #e7e5e0;
		position: relative;
		backdrop-filter: blur(10px);
	}

	.nav-brand a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: #8b4513;
		font-weight: 700;
		font-size: 1.5rem;
		transition: color 0.2s ease;
	}

	.nav-brand a:hover {
		color: #a0522d;
	}

	.logo-icon {
		font-size: 1.8rem;
		animation: steam 2s ease-in-out infinite;
	}

	@keyframes steam {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-2px);
		}
	}

	.menu-toggle {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		z-index: 1001;
	}

	.hamburger {
		display: block;
		width: 25px;
		height: 3px;
		background: #8b4513;
		position: relative;
		transition: all 0.3s ease;
	}

	.hamburger::before,
	.hamburger::after {
		content: '';
		position: absolute;
		width: 25px;
		height: 3px;
		background: #8b4513;
		transition: all 0.3s ease;
	}

	.hamburger::before {
		top: -8px;
	}

	.hamburger::after {
		bottom: -8px;
	}

	.hamburger.open {
		background: transparent;
	}

	.hamburger.open::before {
		transform: rotate(45deg);
		top: 0;
	}

	.hamburger.open::after {
		transform: rotate(-45deg);
		bottom: 0;
	}

	.nav-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.nav-button-link {
		text-decoration: none;
		color: inherit;
		display: block;
		width: 100%;
		height: 100%;
	}

	@media (max-width: 768px) {
		.menu-toggle {
			display: block;
		}

		.nav-actions {
			position: absolute;
			top: 100%;
			right: 0;
			background: #fefdf8;
			border: 1px solid #e7e5e0;
			border-radius: 0.5rem;
			padding: 1rem;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
			flex-direction: column;
			min-width: 150px;
			transform: translateY(-10px);
			opacity: 0;
			visibility: hidden;
			transition: all 0.3s ease;
		}

		.nav-actions.open {
			transform: translateY(0);
			opacity: 1;
			visibility: visible;
		}
	}
</style>
