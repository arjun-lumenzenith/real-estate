/**
 * Application Configuration
 * Centralized configuration for performance tuning and deployments
 */

export const config = {
  // Database configuration
  database: {
    // Connection pool settings
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '30000'), // 30 seconds
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30 seconds
      reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000'), // 1 second
    },
    // Query settings
    query: {
      timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '10000'), // 10 seconds
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '10000'), // 10 seconds
    },
  },

  // API configuration
  api: {
    // Request timeout
    timeout: parseInt(process.env.API_TIMEOUT || '30000'), // 30 seconds
    // Maximum request body size
    maxBodySize: '1mb',
  },

  // Cache configuration
  cache: {
    // Default TTL for cached items (in seconds)
    defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '300'), // 5 minutes
    // TTL for property listings
    propertyTtl: parseInt(process.env.CACHE_PROPERTY_TTL || '3600'), // 1 hour
    // TTL for builder listings
    builderTtl: parseInt(process.env.CACHE_BUILDER_TTL || '86400'), // 24 hours
  },

  // Rate limiting configuration
  rateLimit: {
    // API rate limit
    apiLimit: parseInt(process.env.RATE_LIMIT_API || '1000'), // 1000 requests per minute
    apiWindow: 60,
    // Lead creation rate limit
    leadLimit: parseInt(process.env.RATE_LIMIT_LEAD || '10'), // 10 leads per minute
    leadWindow: 60,
    // Search rate limit
    searchLimit: parseInt(process.env.RATE_LIMIT_SEARCH || '100'), // 100 searches per minute
    searchWindow: 60,
    // Auth rate limit
    authLimit: parseInt(process.env.RATE_LIMIT_AUTH || '5'), // 5 attempts per 5 minutes
    authWindow: 300,
  },

  // Feature flags
  features: {
    // Enable audit logging
    auditLogging: process.env.FEATURE_AUDIT_LOGGING !== 'false',
    // Enable email notifications
    emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'false',
    // Enable PII encryption
    encryptPii: process.env.FEATURE_ENCRYPT_PII === 'true',
  },

  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@lumenzenith.in',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@lumenzenith.in',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Validate critical environment variables
export function validateConfig() {
  const required = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'KV_URL',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}
