'use client';

import posthog from 'posthog-js';
import { useEffect, type ReactNode } from 'react';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? 'phc_oWmBSZnAzYNaA6pX5KpTTh8hVokvR7P6mhc3dLw3TT8p';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
const CONSENT_KEY = 'ubi-analytics-consent';

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const start = () => {
      if (window.localStorage.getItem(CONSENT_KEY) !== 'accepted' || posthog.__loaded) return;

      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true,
        person_profiles: 'never',
      });
    };

    start();
    window.addEventListener('ubi-analytics-consent', start);
    return () => window.removeEventListener('ubi-analytics-consent', start);
  }, []);

  return <>{children}</>;
}
