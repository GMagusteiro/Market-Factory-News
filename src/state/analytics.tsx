import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

import { createTracker, type AnalyticsEvent, type ConsentState } from '@/lib/analytics';

import { useConsent } from './consent';

const ID_KEY = 'marketlens.anonid.v1';
let consentNow: ConsentState = 'unset';
let anonId: string | null = null;

const tracker = createTracker({
  key: process.env.EXPO_PUBLIC_POSTHOG_KEY,
  host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
  getConsent: () => consentNow,
  getId: () => anonId,
  fetchImpl: (url, init) => fetch(url, init),
});

export const track = (event: AnalyticsEvent, props?: Record<string, string | number | boolean>) => {
  void tracker(event, props);
};

let opened = false;

/** Liga o consentimento ao tracker. O identificador anónimo só é criado depois de aceitar. */
export function AnalyticsBridge() {
  const { consent } = useConsent();

  useEffect(() => {
    consentNow = consent;
    if (consent !== 'accepted') {
      if (consent === 'rejected') {
        anonId = null;
        AsyncStorage.removeItem(ID_KEY).catch(() => {});
      }
      return;
    }
    AsyncStorage.getItem(ID_KEY)
      .then((stored) => {
        const id = stored ?? `anon-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
        if (!stored) AsyncStorage.setItem(ID_KEY, id).catch(() => {});
        anonId = id;
        if (!opened) {
          opened = true;
          track('app_opened');
        }
      })
      .catch(() => {});
  }, [consent]);

  return null;
}
