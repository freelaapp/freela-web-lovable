import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface TimelineState {
  jobId: string;
  aceite: boolean;
  pagamento: boolean;
  inicio: boolean;
  fim: boolean;
  feedback: boolean;
  step: number; // 0=contratação, 1=pagamento, 2=inicio, 3=fim, 4=feedback
  paid: boolean;
  checkinDone: boolean;
  checkoutDone: boolean;
  reviewDone: boolean;
}

interface TimelineContextValue {
  getTimeline: (jobId: string) => TimelineState | null;
  updateTimeline: (jobId: string, updates: Partial<TimelineState>) => void;
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
};

const TimelineContext = createContext<TimelineContextValue>({
  getTimeline: () => null,
  updateTimeline: () => {},
  advanceStep: () => {},
  setStep: () => {},
  resetTimeline: () => {},
});

export const useTimeline = () => useContext(TimelineContext);

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
  const [timelines, setTimelines] = useState<Record<string, TimelineState>>({});

  const getTimeline = useCallback(
    (jobId: string): TimelineState | null => timelines[jobId] || null,
    [timelines]
  );

  const updateTimeline = useCallback((jobId: string, updates: Partial<TimelineState>) => {
    setTimelines((prev) => {
      const current = prev[jobId] || { ...defaultTimeline, jobId };
      const merged = { ...current, ...updates };

      // Auto-derive step from boolean states
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

  const advanceStep = useCallback((jobId: string) => {
    setTimelines((prev) => {
      const current = prev[jobId] || { ...defaultTimeline, jobId };
      const nextStep = Math.min(current.step + 1, 4);
      const merged = { ...current, step: nextStep };

      // Update booleans based on step
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

      // Update booleans based on step
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
    <TimelineContext.Provider value={{ getTimeline, updateTimeline, advanceStep, setStep, resetTimeline }}>
      {children}
    </TimelineContext.Provider>
  );
};
