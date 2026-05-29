import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { realtime } from "../services/websocket";
const RealtimeContext = createContext({
  spotUpdates: {},
  occupancyUpdates: {},
  lastSyncTimestamp: null,
  isLive: false,
});
export function RealtimeProvider({ children }) {
  // Tracks individual spot status changes keyed by spot_id
  const [spotUpdates, setSpotUpdates] = useState({});
  // Tracks zone-level occupancy changes keyed by parking_zone_id
  const [occupancyUpdates, setOccupancyUpdates] = useState({});
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(null);
  const [isLive, setIsLive] = useState(!!window.Echo);
  useEffect(() => {
    const unsubSpot = realtime.subscribe("SpotStatusUpdated", (e) => {
      setSpotUpdates((prev) => ({
        ...prev,
        [e.spot_id]: {
          status: e.status,
          parking_zone_id: e.parking_zone_id,
          updated_at: Date.now(),
        },
      }));
    });
    const unsubOccupancy = realtime.subscribe("OccupancyChanged", (e) => {
      setOccupancyUpdates((prev) => ({
        ...prev,
        [e.parking_zone_id]: {
          occupied_spots: e.occupied_spots,
          total_spots: e.total_spots,
          updated_at: Date.now(),
        },
      }));
    });
    const unsubSync = realtime.subscribe("SyncTick", (e) => {
      setLastSyncTimestamp(e.timestamp);
    });
    return () => {
      unsubSpot();
      unsubOccupancy();
      unsubSync();
    };
  }, []);
  return (
    <RealtimeContext.Provider value={{ spotUpdates, occupancyUpdates, lastSyncTimestamp, isLive }}>
      {children}
    </RealtimeContext.Provider>
  );
}
export function useRealtime() {
  return useContext(RealtimeContext);
}
/**
 * Custom hook that calls a refresh callback on every realtime sync tick.
 * Debounces rapid-fire events to prevent excessive re-renders.
 */
export function useRealtimeRefresh(refreshFn, debounceMs = 2000) {
  const timerRef = useRef(null);
  const { lastSyncTimestamp } = useRealtime();
  useEffect(() => {
    if (!lastSyncTimestamp) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      refreshFn();
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastSyncTimestamp, refreshFn, debounceMs]);
}
export default RealtimeContext;