'use client';

import posthog from 'posthog-js';

type AnalyticsValue = string | number | boolean | null | undefined;

export function trackEvent(event: string, properties: Record<string, AnalyticsValue> = {}) {
  posthog.capture(event, {
    ...properties,
    page: typeof window === 'undefined' ? undefined : window.location.pathname,
  });
}

export function trackOutbound(destination: 'trade' | 'chart' | 'payouts' | 'x' | 'telegram' | 'token' | 'website', location: string) {
  trackEvent(`${destination}_clicked`, { location });
}
