"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

export function Select({
  value,
  onValueChange,
  children,
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className={`relative ${className}`}>{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  children,
  className = "",
}: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectTrigger must be used within a Select");
  }

  const { isOpen, setIsOpen } = context;

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectContent({
  children,
  className = "",
  side = "bottom",
}: SelectContentProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectContent must be used within a Select");
  }

  const { isOpen, setIsOpen } = context;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-select]")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const positionStyle =
    side === "top"
      ? { bottom: "100%", left: 0, right: 0, marginBottom: "4px" }
      : { top: "100%", left: 0, right: 0, marginTop: "4px" };

  return (
    <div
      data-select
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-md ${className}`}
      style={positionStyle}
    >
      <div className="p-1">{children}</div>
    </div>
  );
}

export function SelectItem({
  value,
  children,
  className = "",
}: SelectItemProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectItem must be used within a Select");
  }

  const { value: selectedValue, onValueChange, setIsOpen } = context;

  return (
    <button
      type="button"
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-[var(--foreground)] outline-none hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] focus:bg-[var(--accent)] focus:text-[var(--accent-foreground)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
    >
      {selectedValue === value && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
        </span>
      )}
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectValue must be used within a Select");
  }

  const { value } = context;

  return <span>{value || placeholder}</span>;
}
