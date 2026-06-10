"use client";

import { useCallback } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

import { useMap } from "@/components/ui/map";
import { getAirportInfo } from "@/registry/flight-airports-utils";
import type { FlightRecord } from "@/lib/supabase";

export function FlightRoutesPanel({
  flights,
  loading,
  onAddFlight,
}: {
  flights: FlightRecord[];
  loading: boolean;
  onAddFlight: () => void;
}) {
  const { map } = useMap();

  const handleRouteClick = useCallback(
    (flight: FlightRecord) => {
      if (!map) return;
      const from = getAirportInfo(flight.from_code);
      const to = getAirportInfo(flight.to_code);
      if (!from || !to) return;
      const midLng = (from.longitude + to.longitude) / 2;
      const midLat = (from.latitude + to.latitude) / 2;
      map.flyTo({ center: [midLng, midLat], zoom: 2.5, duration: 1500 });
    },
    [map],
  );

  return (
    <>
      {/* Top header bar */}
      <div className="pointer-events-none absolute top-4 right-4 left-4 z-50">
        <div className="bg-card/90 border-border pointer-events-auto flex items-center justify-between rounded-2xl border px-5 py-3 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-black text-white shadow-sm"
            >
              <span className="text-xs font-bold">✈</span>
            </Link>
            <p className="font-semibold">My Travel</p>
          </div>
          <button
            onClick={onAddFlight}
            className="bg-foreground text-background flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
          >
            <Plus className="size-3.5" />
            Add Flight
          </button>
        </div>
      </div>

      {/* Routes panel */}
      <div className="bg-card/90 border-border absolute top-20 right-4 bottom-4 z-40 flex w-72 flex-col overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Flight Routes</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Click a route to focus the globe.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-muted-foreground p-4 text-center text-sm">
              Loading...
            </div>
          ) : flights.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">
              No flights yet.
              <br />
              <button
                onClick={onAddFlight}
                className="text-foreground mt-1 underline underline-offset-2"
              >
                Add your first flight
              </button>
            </div>
          ) : (
            flights.map((flight) => {
              const from = getAirportInfo(flight.from_code);
              const to = getAirportInfo(flight.to_code);
              return (
                <button
                  key={flight.id}
                  onClick={() => handleRouteClick(flight)}
                  className="hover:bg-accent flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors last:border-b-0"
                >
                  <p className="text-sm font-medium">
                    {from?.city ?? flight.from_code} ↔{" "}
                    {to?.city ?? flight.to_code}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {flight.from_code} ↔ {flight.to_code}
                    {from?.country && to?.country
                      ? ` · ${from.country} · ${to.country}`
                      : ""}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
