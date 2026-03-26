import * as React from "react";
import { useState, useEffect } from "react";
import { format, parse, isValid } from "date-fns";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseDisplayDate(input: string): Date | undefined {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 8) return undefined;
  const day = parseInt(digits.slice(0, 2), 10);
  const month = parseInt(digits.slice(2, 4), 10);
  const year = parseInt(digits.slice(4), 10);
  if (year < 1940 || year > new Date().getFullYear()) return undefined;
  if (month < 1 || month > 12) return undefined;
  if (day < 1 || day > 31) return undefined;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined;
  }
  return date;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "DD/MM/AAAA",
}: DatePickerProps) {
  const selectedDate = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isValidDate = selectedDate && isValid(selectedDate);

  const [inputValue, setInputValue] = useState(
    isValidDate ? format(selectedDate, "dd/MM/yyyy") : ""
  );

  useEffect(() => {
    if (isValidDate) {
      setInputValue(format(selectedDate, "dd/MM/yyyy"));
    } else if (!value) {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatDateInput(e.target.value);
    setInputValue(masked);

    const parsed = parseDisplayDate(masked);
    if (parsed && isValid(parsed)) {
      onChange(format(parsed, "yyyy-MM-dd"));
    } else if (masked.replace(/\D/g, "").length === 0) {
      onChange("");
    }
  };

  const handleBlur = () => {
    const parsed = parseDisplayDate(inputValue);
    if (parsed && isValid(parsed)) {
      setInputValue(format(parsed, "dd/MM/yyyy"));
      onChange(format(parsed, "yyyy-MM-dd"));
    } else if (inputValue.replace(/\D/g, "").length === 0) {
      setInputValue("");
      onChange("");
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}
