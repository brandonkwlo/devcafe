import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { redis } from '$lib/server/redis';
import { GROQ_API_KEY } from '$env/static/private';
import { nanoid } from 'nanoid';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { content } = await request.json();

		if (!content || content.length === 0) {
			return json({ error: 'No content provided for analysis' }, { status: 400 });
		}

		// Combine all content for analysis
		const combinedContent = content
			.map((item: any) => {
				return `Content Type: ${item.type}\nTitle: ${item.name}\n\nContent:\n${item.content}\n\n---\n\n`;
			})
			.join('');

		// Generate different types of analysis
		const analysisResults = await Promise.all([
			generateSummary(combinedContent),
			generateLearningPlan(combinedContent),
			generateKeyInsights(combinedContent),
			generateQA(combinedContent)
		]);

		const result = {
			id: nanoid(),
			title: `Analysis Results - ${new Date().toLocaleDateString()}`,
			createdAt: new Date().toISOString(),
			sourceName: content.map((c: any) => c.name).join(', '),
			confidence: 85, // Mock confidence score
			summary: analysisResults[0],
			learningPlan: analysisResults[1],
			insights: analysisResults[2],
			questions: analysisResults[3],
			type: 'comprehensive'
		};

		// Store results in Redis
		await redis.setex(`analysis:${result.id}`, 3600 * 24 * 30, JSON.stringify(result)); // 30 days TTL

		return json(result);
	} catch (error) {
		console.error('Analysis error:', error);
		return json({ error: 'Analysis failed' }, { status: 500 });
	}
};

async function callGroqAPI(prompt: string, systemPrompt: string): Promise<string> {
	if (!GROQ_API_KEY) {
		// Return mock data if no API key
		return 'Mock analysis result - Groq API key not configured';
	}

	try {
		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GROQ_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'llama-3.1-70b-versatile',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: prompt }
				],
				temperature: 0.7,
				max_tokens: 2000
			})
		});

		if (!response.ok) {
			throw new Error(`Groq API error: ${response.status}`);
		}

		const data = await response.json();
		return data.choices[0]?.message?.content || 'No response generated';
	} catch (error) {
		console.error('Groq API call failed:', error);
		return 'Analysis temporarily unavailable - please try again later';
	}
}

async function generateSummary(content: string): Promise<string> {
	const systemPrompt = `You are an expert content analyst. Create concise, informative summaries that capture the key points and main themes of the provided content. Focus on the most important information that a developer would need to know.`;

	const prompt = `Please provide a comprehensive summary of the following content:\n\n${content.substring(0, 4000)}`;

	return await callGroqAPI(prompt, systemPrompt);
}

async function generateLearningPlan(
	content: string
): Promise<Array<{ title: string; description: string; duration: string }>> {
	const systemPrompt = `You are an expert learning designer. Create structured learning plans that help developers master the concepts in the provided content. Break down complex topics into manageable steps with estimated time commitments.`;

	const prompt = `Based on this content, create a structured learning plan with 4-6 steps. For each step, provide a title, description, and estimated duration. Format as JSON array with objects containing 'title', 'description', and 'duration' fields:\n\n${content.substring(0, 4000)}`;

	try {
		const response = await callGroqAPI(prompt, systemPrompt);
		// Try to parse JSON, fallback to mock data if parsing fails
		const parsed = JSON.parse(response);
		return Array.isArray(parsed) ? parsed : getMockLearningPlan();
	} catch {
		return getMockLearningPlan();
	}
}

async function generateKeyInsights(
	content: string
): Promise<Array<{ title: string; description: string }>> {
	const systemPrompt = `You are an expert knowledge extractor. Identify the most valuable insights, patterns, and key takeaways from technical content. Focus on actionable insights that developers can apply immediately.`;

	const prompt = `Extract 4-6 key insights from this content. Format as JSON array with objects containing 'title' and 'description' fields:\n\n${content.substring(0, 4000)}`;

	try {
		const response = await callGroqAPI(prompt, systemPrompt);
		const parsed = JSON.parse(response);
		return Array.isArray(parsed) ? parsed : getMockInsights();
	} catch {
		return getMockInsights();
	}
}

async function generateQA(content: string): Promise<Array<{ question: string; answer: string }>> {
	const systemPrompt = `You are an expert educator. Generate thoughtful questions and comprehensive answers that help reinforce understanding of the content. Focus on questions that test both conceptual understanding and practical application.`;

	const prompt = `Generate 5-7 questions and answers based on this content. Format as JSON array with objects containing 'question' and 'answer' fields:\n\n${content.substring(0, 4000)}`;

	try {
		const response = await callGroqAPI(prompt, systemPrompt);
		const parsed = JSON.parse(response);
		return Array.isArray(parsed) ? parsed : getMockQA();
	} catch {
		return getMockQA();
	}
}

// Mock data functions for fallback
function getMockLearningPlan() {
	return [
		{
			title: 'Foundation Review',
			description: 'Review the basic concepts and terminology covered in the content',
			duration: '30 minutes'
		},
		{
			title: 'Deep Dive Study',
			description: 'Study the main topics in detail with additional research',
			duration: '2 hours'
		},
		{
			title: 'Practical Application',
			description: 'Apply the concepts through hands-on exercises or projects',
			duration: '3 hours'
		},
		{
			title: 'Knowledge Validation',
			description: 'Test your understanding through quizzes or peer discussions',
			duration: '45 minutes'
		}
	];
}

function getMockInsights() {
	return [
		{
			title: 'Key Concept Identified',
			description:
				'The content covers important foundational concepts that are essential for understanding the topic'
		},
		{
			title: 'Practical Applications',
			description:
				'Several real-world applications and use cases are presented that demonstrate practical value'
		},
		{
			title: 'Best Practices',
			description:
				'The material includes recommended approaches and best practices from industry experts'
		}
	];
}

function getMockQA() {
	return [
		{
			question: 'What are the main concepts covered in this content?',
			answer:
				'The content covers several key concepts that are fundamental to understanding the topic area.'
		},
		{
			question: 'How can these concepts be applied in practice?',
			answer:
				'These concepts can be applied through hands-on projects and real-world implementations.'
		},
		{
			question: 'What are the key takeaways for developers?',
			answer:
				'Developers should focus on understanding the core principles and how they apply to their specific use cases.'
		}
	];
}
