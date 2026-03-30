import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

const API_BASE_URL = import.meta.env.API_BASE_URL;

export interface TimelineState {
  jobId: string;
  aceite: boolean;
  pagamento: boolean;
  inicio: boolean;
  fim: boolean;
  feedback: boolean;
  step: number;
  paid: boolean;
  checkinDone: boolean;
  checkoutDone: boolean;
  reviewDone: boolean;
  jobStatus: string;
}

interface TimelineContextValue {
  getTimeline: (jobId: string) => TimelineState | null;
  updateTimeline: (jobId: string, updates: Partial<TimelineState>) => void;
  fetchTimelineFromAPI: (jobId: string) => Promise<void>;
  subscribeTimeline: (jobId: string) => void;
  unsubscribeTimeline: (jobId: string) => void;
  advanceStep: (jobId: string) => void;
  setStep: (jobId: string, step: number) => void;
  resetTimeline: (jobId: string) => void;
}

const defaultTimeline: Omit<TimelineState, "jobId"> = {
  aceite: false,
  pagamento: false,
  inicio: false,
  fim: false,
  feedback: false,
  step: 0,
  paid: false,
  checkinDone: false,
  checkoutDone: false,
  reviewDone: false,
  jobStatus: "",
};

const TimelineContext = createContext<TimelineContextValue>({
  getTimeline: () => null,
  updateTimeline: () => {},
  fetchTimelineFromAPI: async () => {},
  subscribeTimeline: () => {},
  unsubscribeTimeline: () => {},
  advanceStep: () => {},
  setStep: () => {},
  resetTimeline: () => {},
});

export const useTimeline = () => useContext(TimelineContext);

function mapStatusToStep(status: string, paid?: boolean): { step: number; updates: Partial<TimelineState> } {
  const s = status.toLowerCase().trim();
  if (s === "completed" || s === "partially completed") {
    return { step: 4, updates: { inicio: true, fim: true, pagamento: true, feedback: true } };
  }
  if (s === "in progress") {
    return { step: 3, updates: { inicio: true, pagamento: true } };
  }
  if (s === "scheduled") {
    return { step: 2, updates: { inicio: true, pagamento: true } };
  }
  if (s === "unavailable" && paid) {
    return { step: 2, updates: { inicio: true, pagamento: true, paid: true } };
  }
  if (s === "unavailable") {
    return { step: 1, updates: { pagamento: true } };
  }
  return { step: 0, updates: {} };
}

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
  const [timelines, setTimelines] = useState<Record<string, TimelineState>>({});
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const subscribedRef = useRef<Set<string>>(new Set());

  const getTimeline = useCallback(
    (jobId: string): TimelineState | null => timelines[jobId] || null,
    [timelines]
  );

  const updateTimeline = useCallback((jobId: string, updates: Partial<TimelineState>) => {
    setTimelines((prev) => {
      const current = prev[jobId] || { ...defaultTimeline, jobId };
      const merged = { ...current, ...updates };

      if (updates.aceite !== undefined || updates.pagamento !== undefined || updates.inicio !== undefined || updates.fim !== undefined || updates.feedback !== undefined) {
        if (merged.feedback) merged.step = 4;
        else if (merged.fim) merged.step = 3;
        else if (merged.inicio) merged.step = 2;
        else if (merged.pagamento) merged.step = 1;
        else merged.step = 0;
      }

      return { ...prev, [jobId]: merged };
    });
  }, []);

  const fetchTimelineFromAPI = useCallback(async (jobId: string) => {
    if (!jobId) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/jobs/${jobId}`, { method: "GET" });
      if (res.status === 404) return;
      const body = await res.json().catch(() => null);
      const status = (body?.data?.status ?? body?.status ?? "").trim();
      const paid = body?.data?.paid ?? body?.paid;

      if (!status) return;

      const { step, updates } = mapStatusToStep(status, paid === true || paid === "true");

      setTimelines((prev) => {
        const current = prev[jobId] || { ...defaultTimeline, jobId };
        if (step <= current.step && status === current.jobStatus) return prev;
        return {
          ...prev,
          [jobId]: {
            ...current,
            ...updates,
            step: Math.max(step, current.step),
            paid: paid === true || paid === "true" || current.paid,
            jobStatus: status,
          },
        };
      });
    } catch {
      // silently fail
    }
  }, []);

  const subscribeTimeline = useCallback((jobId: string) => {
    if (!jobId || subscribedRef.current.has(jobId)) return;
    subscribedRef.current.add(jobId);

    fetchTimelineFromAPI(jobId);

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const current = timelines[jobId];
      if (current && current.step >= 4) {
        clearInterval(interval);
        delete intervalsRef.current[jobId];
        return;
      }
      fetchTimelineFromAPI(jobId);
    }, 5000);

    intervalsRef.current[jobId] = interval;
  }, [fetchTimelineFromAPI, timelines]);

  const unsubscribeTimeline = useCallback((jobId: string) => {
    if (!jobId) return;
    subscribedRef.current.delete(jobId);
    if (intervalsRef.current[jobId]) {
      clearInterval(intervalsRef.current[jobId]);
      delete intervalsRef.current[jobId];
    }
  }, []);

  // Cleanup all intervals on unmount
  useEffect(() => {
    const intervals = intervalsRef.current;
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, []);

  const advanceStep = useCallback((jobId: string) => {
    setTimelines((prev) => {
      const current = prev[jobId] || { ...defaultTimeline, jobId };
      const nextStep = Math.min(current.step + 1, 4);
      const merged = { ...current, step: nextStep };

      if (nextStep >= 1) merged.pagamento = true;
      if (nextStep >= 2) { merged.pagamento = true; merged.inicio = true; }
      if (nextStep >= 3) { merged.pagamento = true; merged.inicio = true; merged.fim = true; }
      if (nextStep >= 4) { merged.pagamento = true; merged.inicio = true; merged.fim = true; merged.feedback = true; }

      return { ...prev, [jobId]: merged };
    });
  }, []);

  const setStep = useCallback((jobId: string, step: number) => {
    setTimelines((prev) => {
      const current = prev[jobId] || { ...defaultTimeline, jobId };
      const s = Math.max(0, Math.min(step, 4));
      const merged = { ...current, step: s };

      merged.aceite = s >= 0;
      merged.pagamento = s >= 1;
      merged.inicio = s >= 2;
      merged.fim = s >= 3;
      merged.feedback = s >= 4;

      return { ...prev, [jobId]: merged };
    });
  }, []);

  const resetTimeline = useCallback((jobId: string) => {
    setTimelines((prev) => ({ ...prev, [jobId]: { ...defaultTimeline, jobId } }));
  }, []);

  return (
    <TimelineContext.Provider value={{ getTimeline, updateTimeline, fetchTimelineFromAPI, subscribeTimeline, unsubscribeTimeline, advanceStep, setStep, resetTimeline }}>
      {children}
    </TimelineContext.Provider>
  );
};
