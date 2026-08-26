import { useCallback, useState } from "react";
import type { UserLocation } from "../types";

type LocationStatus = "idle" | "loading" | "ready" | "denied" | "error";

type LocationState = {
  status: LocationStatus;
  location: UserLocation | null;
  message: string | null;
};

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({ status: "idle", location: null, message: null });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", location: null, message: "Location is not available in this browser." });
      return;
    }

    setState({ status: "loading", location: null, message: null });
    navigator.geolocation.getCurrentPosition(
      (position) => setState({
        status: "ready",
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        message: null,
      }),
      (error) => setState({
        status: error.code === error.PERMISSION_DENIED ? "denied" : "error",
        location: null,
        message: error.code === error.PERMISSION_DENIED
          ? "Location access was declined. Allow it in your browser settings to compare nearby prices."
          : "We could not determine your location. Please try again.",
      }),
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
    );
  }, []);

  return { ...state, requestLocation };
}
