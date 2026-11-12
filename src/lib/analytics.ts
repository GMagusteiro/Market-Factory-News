// Analytics sem SDK: um POST ao PostHog, só com consentimento e só se houver chave. Pura e testável.
export type ConsentState = 'unset' | 'accepted' | 'rejected';
export type AnalyticsEvent = 'app_opened' | 'onboarding_completed' | 'asset_search_performed';

export interface AnalyticsDeps {
  key: string | undefined;
  host?: string;
  getConsent: () => ConsentState;
  getId: () => string | null;
  fetchImpl: (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<unknown>;
}

/** Devolve `true` se o evento foi enviado. Nunca lança: analytics não pode partir a app. */
export function createTracker(deps: AnalyticsDeps) {
  return async function track(event: AnalyticsEvent, props: Record<string, string | number | boolean> = {}) {
    if (!deps.key || deps.getConsent() !== 'accepted') return false;
    const id = deps.getId();
    if (!id) return false;
    try {
      await deps.fetchImpl(`${deps.host ?? 'https://eu.i.posthog.com'}/capture/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ api_key: deps.key, event, distinct_id: id, properties: props }),
      });
      return true;
    } catch {
      return false;
    }
  };
}
