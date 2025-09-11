import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { redis } from '$lib/server/redis';
import { nanoid } from 'nanoid';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const contentType = request.headers.get('content-type');

		if (contentType?.includes('multipart/form-data')) {
			// Handle file upload
			const formData = await request.formData();
			const file = formData.get('file') as File;

			if (!file) {
				return json({ error: 'No file provided' }, { status: 400 });
			}

			const content = await extractFileContent(file);
			const id = nanoid();

			// Store in Redis
			const fileData = {
				id,
				type: 'file',
				name: file.name,
				size: file.size,
				content,
				uploadedAt: new Date().toISOString()
			};

			await redis.setex(`content:${id}`, 3600 * 24 * 7, JSON.stringify(fileData)); // 7 days TTL

			return json({
				id,
				content,
				message: 'File uploaded successfully'
			});
		} else {
			// Handle JSON data (YouTube, URL, text)
			const { type, url, text } = await request.json();

			let content = '';
			let title = '';
			let metadata = {};

			if (type === 'youtube') {
				const result = await processYouTubeUrl(url);
				content = result.transcript;
				title = result.title;
				metadata = { duration: result.duration, url };
			} else if (type === 'url') {
				const result = await extractWebContent(url);
				content = result.content;
				title = result.title;
				metadata = { url };
			} else if (type === 'text') {
				content = text;
				title = 'Text Input';
			}

			const id = nanoid();
			const contentData = {
				id,
				type,
				title,
				content,
				metadata,
				uploadedAt: new Date().toISOString()
			};

			await redis.setex(`content:${id}`, 3600 * 24 * 7, JSON.stringify(contentData));

			return json({
				id,
				title,
				content,
				...metadata,
				message: 'Content processed successfully'
			});
		}
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Upload failed' }, { status: 500 });
	}
};

async function extractFileContent(file: File): Promise<string> {
	const text = await file.text();

	// Basic text extraction - in production, you'd want more sophisticated parsing
	// for PDFs, DOCX, etc. using libraries like pdf-parse, mammoth, etc.
	if (file.type === 'application/pdf') {
		// For now, return placeholder - you'd integrate pdf-parse here
		return `PDF content extraction not implemented yet. File: ${file.name}`;
	}

	return text;
}

async function processYouTubeUrl(
	url: string
): Promise<{ transcript: string; title: string; duration: string }> {
	// Extract video ID from URL
	const videoId = extractYouTubeVideoId(url);

	if (!videoId) {
		throw new Error('Invalid YouTube URL');
	}

	// In production, you'd use YouTube Data API and transcript APIs
	// For now, return placeholder data
	return {
		transcript: `YouTube transcript extraction not implemented yet. Video ID: ${videoId}`,
		title: 'YouTube Video',
		duration: 'Unknown'
	};
}

async function extractWebContent(url: string): Promise<{ content: string; title: string }> {
	try {
		const response = await fetch(url);
		const html = await response.text();

		// Basic content extraction - in production, you'd use libraries like
		// cheerio, readability, or mercury-parser for better extraction
		const titleMatch = html.match(/<title>(.*?)<\/title>/i);
		const title = titleMatch ? titleMatch[1] : 'Web Article';

		// Very basic content extraction - remove HTML tags
		const content = html
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

		return { content: content.substring(0, 5000), title }; // Limit to 5000 chars
	} catch (error) {
		throw new Error('Failed to extract web content');
	}
}

function extractYouTubeVideoId(url: string): string | null {
	const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
	const match = url.match(regex);
	return match ? match[1] : null;
}
