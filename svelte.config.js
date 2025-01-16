import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			images: {
				sizes: [
					800,
					1920,
				],
				formats: ['image/avif', 'image/webp'],
				minimumCacheTTL: 300,
				domains: ['https://touchland-clp-git-image-optimize-zero-studios.vercel.app/',],
			  }
		}),
	}
};

export default config;
