import { NextResponse } from 'next/server';

const ACTIONS_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain',
  'Access-Control-Expose-Headers': 'X-Action-Version, X-Blockchain-Ids',
  'X-Action-Version': '2.2',
  'X-Blockchain-Ids': 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
};

export function actionJsonResponse(body: object, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: ACTIONS_CORS_HEADERS });
}

export function actionCorsPreflightResponse(): NextResponse {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}

export function actionErrorResponse(message: string, status = 400): NextResponse {
  return actionJsonResponse({ error: message }, status);
}
