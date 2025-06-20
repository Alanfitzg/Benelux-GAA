import { NextResponse } from 'next/server';
import { MESSAGES } from '@/lib/constants';

export type ApiError = {
  error: string;
  details?: string;
  statusCode?: number;
};

export type ApiSuccess<T = unknown> = {
  data?: T;
  message?: string;
};

export function createErrorResponse(
  error: string | Error,
  statusCode: number = 500,
  details?: string
): NextResponse<ApiError> {
  const errorMessage = error instanceof Error ? error.message : error;
  
  console.error(`API Error: ${errorMessage}`, details);
  
  return NextResponse.json(
    {
      error: errorMessage,
      details,
      statusCode,
    },
    { status: statusCode }
  );
}

export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      data,
      message,
    },
    { status: statusCode }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiError> {
  if (error instanceof Error) {
    return createErrorResponse(error.message);
  }
  
  return createErrorResponse(MESSAGES.ERROR.GENERIC);
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<NextResponse<ApiSuccess<T>> | NextResponse<ApiError>> {
  try {
    const result = await handler();
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): string | null {
  for (const field of requiredFields) {
    if (!data[field]) {
      return `Missing required field: ${String(field)}`;
    }
  }
  return null;
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}