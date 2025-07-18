// Simple rate limiting stub for deployment
// In production, you would implement proper rate limiting with Redis or similar

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Simple in-memory rate limiter (not suitable for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const ratelimit = {
  async limit(key: string, limit: number = 100, window: number = 60000): Promise<RateLimitResult> {
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / window)}`;
    
    const current = rateLimitStore.get(windowKey);
    
    if (!current) {
      rateLimitStore.set(windowKey, { count: 1, resetTime: now + window });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + window,
      };
    }
    
    if (current.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: current.resetTime,
      };
    }
    
    current.count++;
    
    return {
      success: true,
      limit,
      remaining: limit - current.count,
      reset: current.resetTime,
    };
  }
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute