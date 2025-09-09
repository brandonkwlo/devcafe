<!-- src/lib/components/Button.svelte -->
<script>
	let { variant = 'primary', size = 'medium', children, ...props } = $props();
</script>

<button class={['btn', `btn-${variant}`, `btn-${size}`]} {...props}>
	{@render children?.()}
</button>

<style>
	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 2rem;
		cursor: pointer;
		transition: all 0.3s ease;
		font-weight: 500;
		letter-spacing: 0.025em;
		position: relative;
		overflow: hidden;
	}

	.btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	.btn:hover::before {
		left: 100%;
	}

	.btn-primary {
		background: linear-gradient(135deg, #8b4513, #a0522d);
		color: #fefdf8;
		box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, #a0522d, #cd853f);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(139, 69, 19, 0.4);
	}

	.btn-secondary {
		background: transparent;
		color: #8b4513;
		border: 2px solid #8b4513;
		box-shadow: 0 2px 4px rgba(139, 69, 19, 0.1);
	}

	.btn-secondary:hover {
		background: #8b4513;
		color: #fefdf8;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
	}

	.btn-small {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
	}

	.btn-medium {
		padding: 0.5rem 1rem;
		font-size: 1rem;
	}

	.btn-large {
		padding: 0.75rem 1.5rem;
		font-size: 1.125rem;
	}

	.btn:active {
		transform: translateY(0);
	}
</style>
