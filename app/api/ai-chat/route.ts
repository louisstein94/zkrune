import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool, convertToModelMessages, jsonSchema } from 'ai';
import { getSystemPrompt } from '@/lib/ai/systemPrompt';

export const maxDuration = 30;
export const runtime = 'nodejs';

function getModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic(process.env.AI_MODEL || 'claude-sonnet-4-20250514');
  }
  return openai(process.env.AI_MODEL || 'gpt-4o-mini');
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: getModel(),
      system: getSystemPrompt(),
      messages: modelMessages,
      maxRetries: 2,
      toolChoice: 'auto',
      tools: {
        prepare_proof: tool({
          description:
            'Call this when you have identified the correct template AND collected all required parameters. Prepares the proof generation UI.',
          inputSchema: jsonSchema({
            type: 'object' as const,
            properties: {
              templateId: {
                type: 'string',
                description: 'Template id, e.g. "balance-proof", "age-verification", "private-voting"',
              },
              params_json: {
                type: 'string',
                description: 'JSON string of parameters, e.g. {"balance":"15000","minimumBalance":"10000"}',
              },
              summary: {
                type: 'string',
                description: "Brief human-readable summary of the proof in the user's language",
              },
            },
            required: ['templateId', 'params_json', 'summary'],
          }),
        }),
        suggest_templates: tool({
          description: 'Show available templates when user is browsing or unsure.',
          inputSchema: jsonSchema({
            type: 'object' as const,
            properties: {
              category: {
                type: 'string',
                description: 'Category filter or "all"',
              },
            },
            required: ['category'],
          }),
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    const status = err?.statusCode || err?.lastError?.statusCode || 500;
    if (status === 529 || err?.message?.includes('Overloaded')) {
      return new Response(
        JSON.stringify({ error: 'AI service is temporarily busy. Please try again in a few seconds.' }),
        { status: 503, headers: { 'Content-Type': 'application/json', 'Retry-After': '5' } },
      );
    }
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
