export const DEFAULT_TIME_ZONE = 'Europe/Lisbon';
/** Valor guardado quando a pessoa quer o fuso do dispositivo. */
export const DEVICE_TIME_ZONE = 'device';

/** Fusos oferecidos nas definições (nomes próprios, iguais em todos os idiomas). */
export const TIME_ZONE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Europe/Lisbon', label: 'Lisbon' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'America/New_York', label: 'New York' },
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'UTC', label: 'UTC' },
];

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Valor guardado ("device" ou IANA) → fuso IANA a usar. Valores inválidos caem para o padrão. */
export function resolveTimeZone(value: string, deviceTz?: string): string {
  if (value === DEVICE_TIME_ZONE) {
    const device = deviceTz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    return device && isValidTimeZone(device) ? device : DEFAULT_TIME_ZONE;
  }
  return isValidTimeZone(value) ? value : DEFAULT_TIME_ZONE;
}

/** Aceita só o que podemos guardar: "device" ou um fuso IANA válido. */
export const isStoredTimeZone = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 64 && (value === DEVICE_TIME_ZONE || isValidTimeZone(value));
