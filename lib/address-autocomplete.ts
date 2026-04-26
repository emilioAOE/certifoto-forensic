/**
 * Cliente para autocompletado de direcciones chilenas via OSM Nominatim.
 *
 * Nominatim es gratis y no requiere API key, pero pide:
 * - Rate limit de 1 request/sec (asegurado por debounce)
 * - User-Agent identificable
 *
 * Alternativa local: dataset estatico de comunas en lib/chile-comunas.ts.
 *
 * En entornos productivos altos, considerar Photon, MapBox o LocationIQ.
 */

import { findComunaByName } from "./chile-comunas";

export interface AddressSuggestion {
  displayName: string; // texto a mostrar
  address: string; // calle + numero (la primera parte del display)
  city: string | null;
  commune: string | null; // matchea contra COMUNAS de Chile si es posible
  region: string | null;
  country: string;
  lat: number;
  lon: number;
  source: "nominatim";
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Busca direcciones en Chile via OSM Nominatim.
 * Restringe a Chile (countrycodes=cl).
 *
 * Limitacion conocida: Nominatim cubre razonable las ciudades grandes pero
 * puede fallar en direcciones rurales o exactas. Para direcciones criticas,
 * el usuario siempre puede ingresar a mano.
 */
export async function searchAddresses(
  query: string,
  signal?: AbortSignal
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    addressdetails: "1",
    limit: "6",
    countrycodes: "cl",
    "accept-language": "es",
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      signal,
      headers: {
        // Nominatim pide User-Agent identificable; en browser no podemos
        // setear User-Agent, pero el origen del request ya identifica el sitio
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as NominatimResult[];

    return data.map(toSuggestion).filter((s): s is AddressSuggestion => s !== null);
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return [];
    console.warn("[address] Nominatim search failed:", err);
    return [];
  }
}

function toSuggestion(r: NominatimResult): AddressSuggestion | null {
  const addr = r.address ?? {};
  const country = addr.country ?? "Chile";
  const countryCode = addr.country_code?.toLowerCase() ?? "cl";

  if (countryCode !== "cl") return null;

  // Calle + numero
  const road = addr.road ?? addr.pedestrian ?? "";
  const houseNumber = addr.house_number ?? "";
  const streetParts = [road, houseNumber].filter(Boolean);
  const address = streetParts.join(" ").trim() || r.display_name.split(",")[0].trim();

  // Ciudad / Comuna
  const city =
    addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? null;

  // Tratar de matchear contra el dataset de comunas chilenas
  let communeMatch: string | null = null;
  const candidates = [
    city,
    addr.suburb,
    addr.neighbourhood,
    addr.municipality,
  ].filter((c): c is string => Boolean(c));
  for (const candidate of candidates) {
    const found = findComunaByName(candidate);
    if (found) {
      communeMatch = found.name;
      break;
    }
  }

  const region = addr.state ?? null;

  return {
    displayName: r.display_name,
    address,
    city: city ?? null,
    commune: communeMatch ?? city ?? null,
    region,
    country,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    source: "nominatim",
  };
}

/**
 * Helper: debounce simple para no saturar Nominatim.
 */
export function debounce<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  wait: number
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: TArgs) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}
