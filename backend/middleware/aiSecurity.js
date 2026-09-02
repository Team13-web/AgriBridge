/**
 * Security & Middleware for AI Chatbot API
 */

// In-memory rate limiting store
const rateLimitMap = new Map();

export function aiSecurityMiddleware(req, res, next) {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 30;     // Max 30 requests per min

    const record = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(clientIp, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests to AgriAI Assistant. Please wait a minute before asking another question.'
      });
    }

    // Input Validation & Prompt Injection Defense
    if (req.body && req.body.message) {
      const message = String(req.body.message);
      
      if (message.length > 1500) {
        return res.status(400).json({
          success: false,
          message: 'Question exceeds maximum length of 1500 characters.'
        });
      }

      // Check malicious prompt injection patterns
      const injectionPatterns = [
        /ignore previous instructions/i,
        /system prompt/i,
        /reveal api key/i,
        /override system/i,
        /drop table/i
      ];

      for (const pattern of injectionPatterns) {
        if (pattern.test(message)) {
          req.body.message = 'Please provide general agricultural assistance for my crop.';
          break;
        }
      }
    }

    next();
  } catch (err) {
    next();
  }
}
