"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserLocation } from "@/types/location";
import { resolveLocationCoords } from "@/lib/india-city-coordinates";
import { useAuth } from "@/lib/auth";

interface LocationContextType {
  location: UserLocation;
  setLocation: (partial: Partial<Pick<UserLocation, "city" | "state">>) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_LOCATION: UserLocation = {
  city: "Bhubaneswar",
  state: "Odisha",
  lat: 20.2961,
  lng: 85.8245,
  label: "Bhubaneswar, Odisha",
};

const LOCATION_STORAGE_KEY = "civicvoice_user_location";

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [location, setLocationState] = useState<UserLocation>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(true);

  // Parse location string (e.g. "Bhubaneswar, Odisha" or "Bhubaneswar")
  const parseLocationString = (raw: string): { city: string; state: string } => {
    if (!raw) return { city: "Bhubaneswar", state: "Odisha" };
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { city: parts[0], state: parts.slice(1).join(", ") };
    } else if (parts.length === 1) {
      return { city: parts[0], state: "India" };
    }
    return { city: "Bhubaneswar", state: "Odisha" };
  };

  // Helper to build a complete UserLocation object
  const buildLocationObject = (city: string, state: string): UserLocation => {
    const cleanCity = city.trim() || "Bhubaneswar";
    const cleanState = state.trim() || "Odisha";
    const { lat, lng } = resolveLocationCoords(cleanCity, cleanState);
    return {
      city: cleanCity,
      state: cleanState,
      lat,
      lng,
      label: `${cleanCity}, ${cleanState}`,
    };
  };

  // Hydrate from user profile / localStorage on mount (client-side safe)
  useEffect(() => {
    try {
      if (user?.location) {
        const { city, state } = parseLocationString(user.location);
        const resolved = buildLocationObject(city, state);
        setLocationState(resolved);
      } else {
        const saved = typeof window !== "undefined" ? localStorage.getItem(LOCATION_STORAGE_KEY) : null;
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.city && parsed.state) {
            const resolved = buildLocationObject(parsed.city, parsed.state);
            setLocationState(resolved);
          }
        }
      }
    } catch (e) {
      console.error("Failed to hydrate location context:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.location]);

  // Expose setLocation method
  const setLocation = useCallback(
    async (partial: Partial<Pick<UserLocation, "city" | "state">>) => {
      const newCity = partial.city !== undefined ? partial.city : location.city;
      const newState = partial.state !== undefined ? partial.state : location.state;

      const newLocation = buildLocationObject(newCity, newState);
      setLocationState(newLocation);

      // Persist to localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
        }
      } catch (err) {
        console.warn("Failed to write location to localStorage:", err);
      }

      // Persist to Auth user profile if available
      try {
        if (updateProfile) {
          updateProfile({ location: newLocation.label });
        }
      } catch (err) {
        console.warn("Failed to update location in Auth profile:", err);
      }
    },
    [location, updateProfile]
  );

  return (
    <LocationContext.Provider value={{ location, setLocation, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
