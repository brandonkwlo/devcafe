import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { redis } from '$lib/server/redis';
import { nanoid } from 'nanoid';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const result = await request.json();

		if (!result || !result.title) {
			return json({ error: 'Invalid result data' }, { status: 400 });
		}

		// Generate a unique key for the saved result
		const saveId = result.id || nanoid();
		const saveKey = `saved:${saveId}`;

		// Add save metadata
		const savedResult = {
			...result,
			id: saveId,
			savedAt: new Date().toISOString(),
			type: 'saved_analysis'
		};

		// Store in Redis with longer TTL for saved results
		await redis.setex(saveKey, 3600 * 24 * 90, JSON.stringify(savedResult)); // 90 days TTL

		// Also add to a list of saved results for easy retrieval
		await redis.lpush('saved_results_list', saveId);
		await redis.ltrim('saved_results_list', 0, 99); // Keep only last 100 saved results

		return json({
			success: true,
			id: saveId,
			message: 'Result saved successfully'
		});
	} catch (error) {
		console.error('Save result error:', error);
		return json({ error: 'Failed to save result' }, { status: 500 });
	}
};

export const GET: RequestHandler = async () => {
	try {
		// Get list of saved result IDs
		const savedIds = await redis.lrange('saved_results_list', 0, -1);

		if (savedIds.length === 0) {
			return json({ results: [] });
		}

		// Get all saved results
		const pipeline = redis.pipeline();
		savedIds.forEach((id) => {
			pipeline.get(`saved:${id}`);
		});

		const results = await pipeline.exec();
		const savedResults =
			results
				?.map(([err, result]) => {
					if (err || !result) return null;
					try {
						return JSON.parse(result as string);
					} catch {
						return null;
					}
				})
				.filter(Boolean) || [];

		return json({ results: savedResults });
	} catch (error) {
		console.error('Get saved results error:', error);
		return json({ error: 'Failed to retrieve saved results' }, { status: 500 });
	}
};
