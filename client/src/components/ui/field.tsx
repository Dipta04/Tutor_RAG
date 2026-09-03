"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useState, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";
import { IconChevronDown } from "@/components/icons";

const controlClasses =
  "w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink " +
  "placeholder:text-ink-faint transition-colors duration-150 " +
  "hover:border-ink-faint/40 focus:border-accent focus:outline-none " +
  "focus-visible:outline-none disabled:opacity-50";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, "h-11", className)} {...props} />;
}

export function Select({
  className,
  children,
  value,
  onChange,
  id,
  disabled,
}: {
  className?: string;
  children?: ReactNode;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Extract options from children
  const options = Array.isArray(children) 
    ? children 
    : children 
    ? [children] 
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: optionValue },
        currentTarget: { value: optionValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const selectedOption = options.find((opt: any) => 
    String(opt.props?.value) === String(value)
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          controlClasses,
          "h-11 flex items-center justify-between",
          className
        )}
      >
        <span>{selectedOption?.props?.children || value}</span>
        <IconChevronDown 
          className={cn(
            "h-4 w-4 text-ink-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      
      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-1 w-full rounded-xl border border-line bg-surface shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            "max-h-60 overflow-auto scrollbar-thin"
          )}
        >
          {options.map((option: any, index: number) => {
            const optionValue = String(option.props?.value);
            const isSelected = String(value) === optionValue;
            
            return (
              <button
                key={optionValue || index}
                type="button"
                onClick={() => handleSelect(optionValue)}
                className={cn(
                  "w-full px-3.5 py-2.5 text-left text-sm transition-colors duration-150",
                  "hover:bg-accent/10 focus:bg-accent/10 focus:outline-none",
                  isSelected && "bg-accent/5 text-accent font-medium",
                  index === 0 && "rounded-t-xl",
                  index === options.length - 1 && "rounded-b-xl"
                )}
              >
                {option.props?.children}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
