class RealtimeService {
  constructor() {
    this.listeners = new Map();
    this.pollingInterval = null;
    this.init();
  }
  init() {
    console.log("📡 [Realtime] Initializing Smart Parking event stream...");
    
    // Check if Laravel Echo is configured in window (e.g. injected or present)
    if (window.Echo) {
      console.log("⚡ [Realtime] Laravel Echo found! Hooking Reverb channels...");
      this.channel = window.Echo.channel("parking-spots");
      
      this.channel.listen(".SpotStatusUpdated", (e) => {
        console.log("🔔 [Realtime] Spot update received:", e);
        this.emit("SpotStatusUpdated", e);
      });
      
      this.channel.listen(".OccupancyChanged", (e) => {
        console.log("🔔 [Realtime] Occupancy change received:", e);
        this.emit("OccupancyChanged", e);
      });
    } else {
      console.log("ℹ️ [Realtime] Echo/Reverb not found in window. Initializing high-performance adaptive polling fallback.");
      this.startPollingFallback();
    }
  }
  startPollingFallback() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    // Polls or triggers a global dispatch every 8 seconds to synchronize active zones
    this.pollingInterval = setInterval(() => {
      const event = new CustomEvent("parking-realtime-sync");
      window.dispatchEvent(event);
      this.emit("SyncTick", { timestamp: Date.now() });
    }, 8000);
  }
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.unsubscribe(event, callback);
  }
  unsubscribe(event, callback) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event);
    const index = list.indexOf(callback);
    if (index > -1) list.splice(index, 1);
  }
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`❌ [Realtime] Error executing subscriber for ${event}:`, err);
      }
    });
  }
  destroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (window.Echo && this.channel) {
      window.Echo.leaveChannel("parking-spots");
    }
  }
}
export const realtime = new RealtimeService();
export default realtime;
