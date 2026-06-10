"use client";

import { useEffect, useState } from "react";

import { Map } from "@/components/ui/map";
import { FlightRoutes } from "@/registry/flight";
import {
  supabase,
  isSupabaseConfigured,
  type FlightRecord,
} from "@/lib/supabase";
import { computeStats } from "@/lib/travel-utils";
import { FlightRoutesPanel } from "./flight-routes-panel";
import { AddFlightDialog } from "./add-flight-dialog";
import { TravelStats } from "./travel-stats";

export function MyTravelPage() {
  const [flights, setFlights] = useState<FlightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from("flights")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setFlights(data ?? []);
        setLoading(false);
      });
  }, []);

  const routes = flights.map((f) => ({
    from: f.from_code,
    to: f.to_code,
    tripType: f.trip_type,
  }));

  const stats = computeStats(flights);

  if (!isSupabaseConfigured) {
    return (
      <main className="flex h-screen items-center justify-center bg-card">
        <div className="text-center">
          <p className="text-lg font-semibold">Supabase not configured</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col">
      <div className="relative flex-1 overflow-hidden">
        <Map
          className="h-full w-full"
          projection={{ type: "globe" }}
          center={[20, 20]}
          zoom={1.2}
          attributionControl={false}
        >
          <FlightRoutesPanel
            flights={flights}
            loading={loading}
            onAddFlight={() => setShowAddDialog(true)}
          />
          {routes.length > 0 && (
            <FlightRoutes routes={routes} showAirports showLabel />
          )}
        </Map>
      </div>
      <TravelStats stats={stats} />
      {showAddDialog && (
        <AddFlightDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={(flight) => setFlights((prev) => [flight, ...prev])}
        />
      )}
    </main>
  );
}
