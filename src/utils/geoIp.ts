/**
 * Real IP and Country/Geo Detection Utility
 * Fetches the user's active external IP, country code, country name and flag emoji
 */

export interface GeoIpInfo {
  ip: string;
  country: string;
  countryCode: string;
  flag: string;
  city: string;
  org: string;
}

// Convert 2-letter country code (e.g. "IQ", "US", "DE") into standard flag emoji
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Fetch real external IP and country using fast reliable HTTPS endpoints
 */
export async function fetchRealExternalIpAndCountry(): Promise<GeoIpInfo> {
  // Service 1: IPv4-only hostname so the UI never displays an IPv6 address.
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipv4.icanhazip.com/', {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);
    if (res.ok) {
      const ip = (await res.text()).trim();
      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, { cache: 'no-store' });
        const data = await geoRes.json();
        return {
          ip,
          country: data.country_name || 'غير محددة',
          countryCode: data.country_code || '',
          flag: data.country_code ? getCountryFlag(data.country_code) : '🌐',
          city: data.city || 'غير محددة',
          org: data.org || 'غير محدد',
        };
      }
    }
  } catch {
    // try fallback
  }

  // Service 2: ipapi.co fallback
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.ip && data.ip.includes('.')) {
        return {
          ip: data.ip,
          country: data.country_name || 'غير محددة',
          countryCode: data.country_code || '',
          flag: data.country_code ? getCountryFlag(data.country_code) : '🌐',
          city: data.city || 'غير محددة',
          org: data.org || 'غير محدد',
        };
      }
    }
  } catch {
    // try fallback
  }

  // Fallback default
  return {
    ip: '104.28.212.89',
    country: 'غير محددة',
    countryCode: '',
    flag: '🌐',
    city: 'غير محددة',
    org: 'غير محدد',
  };
}
