/**
 * AI client for generating application answers.
 * Configurable LLM provider via env (e.g. OPENAI_API_KEY, OPENAI_BASE_URL).
 */

export interface GenerateAnswerContext {
	resumeOrProfile: string;
	jobDescription: string;
	question: string;
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

function getConfig(): { apiKey: string; baseUrl: string } {
	const apiKey = process.env["OPENAI_API_KEY"];
	const baseUrl =
		process.env["OPENAI_BASE_URL"]?.replace(/\/$/, "") ?? DEFAULT_BASE_URL;
	if (!apiKey?.trim()) {
		throw new Error(
			"OPENAI_API_KEY is not set; required for AI answer generation",
		);
	}
	return { apiKey, baseUrl };
}

/**
 * Generate a text answer for an open-ended application question using the configured LLM.
 */
export async function generateAnswer(
	context: GenerateAnswerContext,
): Promise<string> {
	const { apiKey, baseUrl } = getConfig();
	const model = process.env["OPENAI_MODEL"] ?? "gpt-3.5-turbo";

	const systemContent = `You are a professional writing job application answers. Use the candidate's resume/profile and the job description to write a concise, relevant answer to the application question. Be honest and specific.`;

	const userContent = `Job description:\n${context.jobDescription}\n\nCandidate profile/resume:\n${context.resumeOrProfile}\n\nApplication question: ${context.question}\n\nWrite a short answer (2-4 sentences):`;

	const body = {
		model,
		messages: [
			{ role: "system" as const, content: systemContent },
			{ role: "user" as const, content: userContent },
		],
		max_tokens: 300,
	};

	const res = await fetch(`${baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const errText = await res.text();
		throw new Error(
			`AI API error ${res.status}: ${errText.slice(0, 200)}`,
		);
	}

	const data = (await res.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	const content = data.choices?.[0]?.message?.content?.trim();
	if (content == null || content === "") {
		throw new Error("AI API returned empty response");
	}
	return content;
}
