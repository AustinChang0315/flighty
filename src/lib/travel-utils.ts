import { airports } from "@/registry/flight-airports";
import type { FlightRecord } from "./supabase";

function haversineDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3958.8;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getFlightDistanceMiles(
  fromCode: string,
  toCode: string,
): number {
  const from = airports[fromCode.toUpperCase()];
  const to = airports[toCode.toUpperCase()];
  if (!from || !to) return 0;
  return Math.round(
    haversineDistanceMiles(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude,
    ),
  );
}

export type TravelStats = {
  totalFlights: number;
  distanceFlown: number;
  airportsVisited: number;
  countries: number;
};

export function computeStats(flights: FlightRecord[]): TravelStats {
  const airportCodes = new Set<string>();
  const countryNames = new Set<string>();
  let totalDistance = 0;

  for (const flight of flights) {
    const from = airports[flight.from_code.toUpperCase()];
    const to = airports[flight.to_code.toUpperCase()];
    if (from) {
      airportCodes.add(from.code);
      countryNames.add(from.country);
    }
    if (to) {
      airportCodes.add(to.code);
      countryNames.add(to.country);
    }
    const dist = getFlightDistanceMiles(flight.from_code, flight.to_code);
    totalDistance += flight.trip_type === "round-trip" ? dist * 2 : dist;
  }

  return {
    totalFlights: flights.length,
    distanceFlown: Math.round(totalDistance),
    airportsVisited: airportCodes.size,
    countries: countryNames.size,
  };
}
