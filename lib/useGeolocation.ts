"use client";

import { useCallback, useState } from "react";

export type GeolocationState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "ready"; latitude: number; longitude: number }
  | { status: "denied" }
  | { status: "unavailable"; message: string };

const OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Mirrors the reference app's location state machine:
 * idle → requesting → ready | denied | unavailable (every state is surfaced).
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: "idle" });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState({
        status: "unavailable",
        message: "Geolocation is not supported by this browser.",
      });
      return;
    }
    setState({ status: "requesting" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "ready",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setState({ status: "denied" });
        } else {
          setState({
            status: "unavailable",
            message: "Couldn't get your location. Try again or describe it below.",
          });
        }
      },
      OPTIONS,
    );
  }, []);

  const clear = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, request, clear };
}
