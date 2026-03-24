import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool, convertToModelMessages, jsonSchema } from 'ai';
import { getCircuitSystemPrompt } from '@/lib/ai/circuitSystemPrompt';

export const maxDuration = 45;
export const runtime = 'nodejs';

function getModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic(process.env.AI_MODEL || 'claude-sonnet-4-20250514');
  }
  return openai(process.env.AI_MODEL || 'gpt-4o-mini');
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: getModel(),
    system: getCircuitSystemPrompt(),
    messages: modelMessages,
    toolChoice: 'auto',
    tools: {
      generate_circuit: tool({
        description:
          'Generate a complete ZK circuit with Circom code and visual graph. Call this when you have enough information to design the circuit.',
        inputSchema: jsonSchema({
          type: 'object' as const,
          properties: {
            name: {
              type: 'string',
              description: 'Circuit name in PascalCase (e.g. "BalanceProof")',
            },
            description: {
              type: 'string',
              description: 'Brief description of what the circuit proves',
            },
            circom_code: {
              type: 'string',
              description: 'Complete, valid Circom 2.0 code for the circuit',
            },
            nodes_json: {
              type: 'string',
              description:
                'JSON array of React Flow nodes. Each node: { id, type, position: {x,y}, data: {label, ...} }',
            },
            edges_json: {
              type: 'string',
              description:
                'JSON array of React Flow edges. Each edge: { id, source, target, sourceHandle?, targetHandle?, animated: true }',
            },
          },
          required: ['name', 'description', 'circom_code', 'nodes_json', 'edges_json'],
        }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
