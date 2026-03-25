import { useMemo, useCallback } from "react";
import { WheelPicker, WheelPickerWrapper } from "@ncdai/react-wheel-picker";

interface WheelDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
  disabled?: boolean;
}

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseValue(value: string): { year: string; month: string; day: string } {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return { year, month, day };
  }
  const now = new Date();
  return {
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1).padStart(2, "0"),
    day: String(now.getDate()).padStart(2, "0"),
  };
}

const pickerClassNames = {
  optionItem: "text-sm text-muted-foreground",
  highlightWrapper: "text-base font-semibold text-foreground",
};

export function WheelDatePicker({
  value,
  onChange,
  minYear = 1940,
  maxYear = new Date().getFullYear(),
  disabled = false,
}: WheelDatePickerProps) {
  const parsed = parseValue(value);

  const yearOptions = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const y = String(maxYear - i);
        return { value: y, label: y };
      }),
    [minYear, maxYear]
  );

  const dayOptions = useMemo(() => {
    const days = getDaysInMonth(Number(parsed.year), Number(parsed.month));
    return Array.from({ length: days }, (_, i) => {
      const d = String(i + 1).padStart(2, "0");
      return { value: d, label: d };
    });
  }, [parsed.year, parsed.month]);

  const handleYearChange = useCallback(
    (year: string) => {
      const days = getDaysInMonth(Number(year), Number(parsed.month));
      const day = Math.min(Number(parsed.day), days);
      onChange(`${year}-${parsed.month}-${String(day).padStart(2, "0")}`);
    },
    [parsed.month, parsed.day, onChange]
  );

  const handleMonthChange = useCallback(
    (month: string) => {
      const days = getDaysInMonth(Number(parsed.year), Number(month));
      const day = Math.min(Number(parsed.day), days);
      onChange(`${parsed.year}-${month}-${String(day).padStart(2, "0")}`);
    },
    [parsed.year, parsed.day, onChange]
  );

  const handleDayChange = useCallback(
    (day: string) => {
      onChange(`${parsed.year}-${parsed.month}-${day}`);
    },
    [parsed.year, parsed.month, onChange]
  );

  if (disabled) {
    return (
      <div className="flex items-center justify-center h-10 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground">
        {value || "--"}
      </div>
    );
  }

  return (
    <WheelPickerWrapper className="flex gap-2 rounded-xl border border-border bg-background p-2">
      <div className="flex-1">
        <p className="text-[10px] text-center text-muted-foreground mb-1 font-medium uppercase tracking-wider">
          Dia
        </p>
        <WheelPicker
          options={dayOptions}
          value={parsed.day}
          onValueChange={handleDayChange}
          infinite
          visibleCount={4}
          optionItemHeight={36}
          classNames={pickerClassNames}
        />
      </div>
      <div className="flex-[1.5]">
        <p className="text-[10px] text-center text-muted-foreground mb-1 font-medium uppercase tracking-wider">
          Mês
        </p>
        <WheelPicker
          options={MONTHS}
          value={parsed.month}
          onValueChange={handleMonthChange}
          infinite
          visibleCount={4}
          optionItemHeight={36}
          classNames={pickerClassNames}
        />
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-center text-muted-foreground mb-1 font-medium uppercase tracking-wider">
          Ano
        </p>
        <WheelPicker
          options={yearOptions}
          value={parsed.year}
          onValueChange={handleYearChange}
          infinite
          visibleCount={4}
          optionItemHeight={36}
          classNames={pickerClassNames}
        />
      </div>
    </WheelPickerWrapper>
  );
}
