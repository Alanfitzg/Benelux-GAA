import { prisma } from "@/lib/prisma";

/**
 * Retry a database operation with exponential backoff
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        console.error(`Database operation failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Check if an error is a database connection error
 */
export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error) return false;
  
  const err = error as { message?: string; code?: string };
  const errorMessage = err.message?.toLowerCase() || '';
  const errorCode = err.code || '';
  
  return (
    errorMessage.includes("can't reach database server") ||
    errorMessage.includes("connection refused") ||
    errorMessage.includes("timeout") ||
    errorCode === 'P1001' || // Connection timeout
    errorCode === 'P1002' || // Connection refused
    errorCode === 'P1008'    // Connection timeout
  );
}

/**
 * Test database connectivity
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}