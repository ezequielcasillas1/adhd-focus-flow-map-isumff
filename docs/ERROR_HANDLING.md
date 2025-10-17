
# Error Handling and Logging System

This document describes the comprehensive error handling and logging system implemented in the Flow Focus app.

## Overview

The error handling system provides:
- **Error Boundaries** for catching React component errors
- **Global Error Logging** with Sentry integration for production
- **User-Friendly Error Messages** with recovery options
- **Development Tools** for testing error scenarios
- **Performance Monitoring** and breadcrumb tracking
- **Environment-Specific Configuration** for different deployment stages

## Components

### 1. ErrorBoundary Component (`components/ErrorBoundary.tsx`)

A React Error Boundary that catches JavaScript errors anywhere in the component tree.

**Features:**
- Catches and displays user-friendly error messages
- Provides retry functionality with smart retry limits
- Generates detailed error reports for sharing
- Shows error details in development mode
- Integrates with the logging system

**Usage:**
```tsx
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### 2. Error Logger (`utils/errorLogger.ts`)

A comprehensive logging utility that handles error reporting and monitoring.

**Key Functions:**
- `initializeErrorLogging()` - Initialize the error logging system
- `logError(error, context, level)` - Log errors with context
- `logWarning(message, context)` - Log warnings
- `logInfo(message, context)` - Log info messages
- `setUserContext(userId, email)` - Set user context for error tracking
- `addBreadcrumb(message, category, data)` - Add debugging breadcrumbs
- `startTransaction(name, operation)` - Track performance

**Example:**
```tsx
import { logError, addBreadcrumb, setUserContext } from '@/utils/errorLogger';

// Set user context
setUserContext('user-123', 'user@example.com');

// Add breadcrumb
addBreadcrumb('User clicked submit button', 'user', { formData: {...} });

// Log error
try {
  // Some operation
} catch (error) {
  logError(error, {
    customData: {
      operation: 'user-registration',
      step: 'validation',
    },
  });
}
```

### 3. Error Testing Component (`components/ErrorTestComponent.tsx`)

A development-only component for testing error handling scenarios.

**Available Tests:**
- Runtime errors (caught by ErrorBoundary)
- Async errors (logged to monitoring)
- Warning logs
- Info logs
- Performance tracking
- Breadcrumb trails

**Access:** Available in Settings screen when in development mode.

## Configuration

### Environment Variables

Add these to your `.env` file or Expo configuration:

```bash
# Sentry DSN for error monitoring (production)
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### Monitoring Configuration (`app/config/monitoring.ts`)

Centralized configuration for error monitoring, logging levels, and feature flags.

## Production Setup

### 1. Sentry Setup

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new React Native project
3. Get your DSN from the project settings
4. Add the DSN to your environment variables:
   ```bash
   EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

### 2. Error Monitoring Dashboard

Once configured, you'll have access to:
- Real-time error tracking
- Performance monitoring
- User session replays (if enabled)
- Release tracking
- Custom dashboards and alerts

## Development Features

### Error Testing Tools

In development mode, access the error testing tools through:
1. Go to Settings screen
2. Toggle "Error Testing Tools" on
3. Test various error scenarios

### Console Logging

All errors are logged to the console with enhanced information:
- Error details and stack traces
- User context and device information
- Breadcrumb trails leading to the error
- Performance metrics

## Best Practices

### 1. Error Context

Always provide context when logging errors:

```tsx
logError(error, {
  userId: user.id,
  customData: {
    feature: 'session-timer',
    action: 'start-session',
    sessionType: 'speed',
  },
});
```

### 2. Breadcrumbs

Use breadcrumbs to track user actions:

```tsx
addBreadcrumb('User started session', 'user', {
  sessionType: 'speed',
  duration: 25,
});
```

### 3. Performance Tracking

Track important operations:

```tsx
const transaction = startTransaction('session-creation', 'user-action');
// ... perform operation
transaction.finish();
```

### 4. User Context

Set user context after authentication:

```tsx
// In your auth context
if (session?.user) {
  setUserContext(session.user.id, session.user.email);
}
```

## Error Categories

The system categorizes errors for better organization:

- **AUTHENTICATION** - Login, signup, session errors
- **NETWORK** - API calls, connectivity issues
- **STORAGE** - Database, AsyncStorage errors
- **UI** - Component rendering, navigation errors
- **PERFORMANCE** - Slow operations, memory issues
- **BUSINESS_LOGIC** - App-specific logic errors
- **THIRD_PARTY** - External service errors
- **UNKNOWN** - Uncategorized errors

## Privacy and Security

### Data Protection

- User emails are filtered out in production error reports
- Sensitive data is excluded from error context
- Stack traces are cleaned to remove internal paths
- User consent is respected for error reporting

### GDPR Compliance

- Users can opt out of error reporting
- Personal data is minimized in error reports
- Data retention policies are configurable
- User data can be deleted on request

## Troubleshooting

### Common Issues

1. **Sentry not receiving errors**
   - Check DSN configuration
   - Verify environment variables
   - Ensure production build

2. **Too many error reports**
   - Adjust sample rates in configuration
   - Implement error deduplication
   - Filter out known issues

3. **Missing context in errors**
   - Ensure user context is set after auth
   - Add more breadcrumbs in critical paths
   - Include relevant custom data

### Debug Mode

Enable debug logging in development:

```tsx
import { logDebug } from '@/utils/errorLogger';

logDebug('Debug information', {
  customData: { debugInfo: 'value' },
});
```

## Integration with Other Systems

### Authentication Context

The error logging system automatically integrates with the authentication context to:
- Set user context when users sign in
- Clear user context when users sign out
- Track authentication-related errors

### App Context

Errors related to app state changes are automatically tracked with relevant context.

## Monitoring and Alerts

### Production Monitoring

Set up alerts for:
- Error rate spikes
- New error types
- Performance degradation
- User session issues

### Dashboard Metrics

Track key metrics:
- Error frequency by type
- User impact (affected users)
- Performance trends
- Recovery success rates

## Future Enhancements

Planned improvements:
- Automatic error recovery strategies
- Machine learning for error prediction
- Enhanced user feedback collection
- Integration with customer support systems
- Advanced performance profiling
