/**
 * Network latency utilities.
 *
 * Transfer accounting deliberately does not live here: generated download and
 * upload probes measure the probe itself rather than the user's VPN traffic.
 * The application reads transfer totals from WireGuard's native backend instead.
 */

/**
 * Measure real latency (RTT) using HTTP probe with cache-busting
 */
export async function measureRealPing(): Promise<number> {
  // We use reliable, fast Anycast edge endpoints with tiny payloads
  const probeUrls = [
    `https://1.1.1.1/cdn-cgi/trace?_t=${Date.now()}`,
    `https://cloudflare.com/cdn-cgi/trace?_t=${Date.now()}`,
    `https://www.google.com/generate_204?_t=${Date.now()}`
  ];

  for (const url of probeUrls) {
    const startTime = performance.now();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 3500);

      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });

      const latency = Math.round(performance.now() - startTime);
      return Math.max(8, latency);
    } catch {
      // try next fallback
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  // No fabricated fallback: zero means that no RTT sample could be obtained.
  return 0;
}
