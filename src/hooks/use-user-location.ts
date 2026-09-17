import { useCallback, useEffect, useSyncExternalStore } from "react";
import { nearestCity, type Coords } from "@/lib/geo";

type LocationState = {
  coords: Coords | null;
  city: string | null;
  status: "idle" | "prompt" | "locating" | "granted" | "denied" | "unsupported";
};

const STORAGE_KEY = "y3fr3-location-allowed";

let state: LocationState = { coords: null, city: null, status: "idle" };
const listeners = new Set<() => void>();
let requested = false;

function set(patch: Partial<LocationState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const serverSnapshot: LocationState = { coords: null, city: null, status: "idle" };

function locate() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    set({ status: "unsupported" });
    return;
  }
  set({ status: "locating" });
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* storage unavailable */
      }
      set({ coords, city: nearestCity(coords).city, status: "granted" });
    },
    () => set({ status: "denied" }),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
  );
}

async function bootstrap() {
  if (requested) return;
  requested = true;
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    set({ status: "unsupported" });
    return;
  }
  let remembered = false;
  try {
    remembered = localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    /* storage unavailable */
  }
  try {
    const perm = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
    if (perm?.state === "granted") return locate();
    if (perm?.state === "denied") return set({ status: "denied" });
  } catch {
    /* permissions API unavailable */
  }
  if (remembered) return locate();
  set({ status: "prompt" });
}

/**
 * Shared user-location state. Auto-detects when the browser already has
 * permission, otherwise exposes `request()` for an explicit opt-in.
 */
export function useUserLocation() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => serverSnapshot);

  useEffect(() => {
    void bootstrap();
  }, []);

  const request = useCallback(() => locate(), []);
  const dismiss = useCallback(() => set({ status: "idle" }), []);

  return { ...snapshot, request, dismiss };
}
