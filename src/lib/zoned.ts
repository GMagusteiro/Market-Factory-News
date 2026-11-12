/** Converte uma hora local num fuso IANA (ex.: 14:00 em America/New_York) para o instante UTC, respeitando o horário de verão. */
export function zonedToUtc(date: string, time: string, timeZone: string): Date {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  const offsetAt = (ms: number) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
    }).formatToParts(new Date(ms));
    const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
    return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute')) - ms;
  };
  // Duas iterações resolvem a fronteira da mudança de hora.
  let guess = asUtc - offsetAt(asUtc);
  guess = asUtc - offsetAt(guess);
  return new Date(guess);
}
