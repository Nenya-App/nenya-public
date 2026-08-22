"use client";

import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Slider } from "./slider";
import { Input } from "./input";
import { Button } from "./button";
import { Label } from "./label";
import { cn } from "./utils";

interface SnappingSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
  snapToFive?: boolean;
}

export function SnappingSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  leftLabel,
  rightLabel,
  className,
  snapToFive = true,
}: SnappingSliderProps) {
  const currentValue = value[0] ?? min;

  // Function to snap value to nearest 5
  const snapToNearest5 = (val: number): number => {
    return Math.round(val / 5) * 5;
  };

  // Handle slider value change with snapping
  const handleSliderChange = (newValue: number[]) => {
    if (snapToFive) {
      const snappedValue = snapToNearest5(newValue[0]);
      onValueChange([Math.max(min, Math.min(max, snappedValue))]);
    } else {
      onValueChange(newValue);
    }
  };

  // Handle direct input change (no snapping)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = parseInt(val);
    if (!isNaN(num) && num >= min && num <= max) {
      onValueChange([num]);
    } else if (val === '') {
      // Allow empty input
      onValueChange([min]);
    }
  };

  // Handle up/down button clicks
  const handleIncrement = () => {
    const newValue = Math.min(max, currentValue + 1);
    onValueChange([newValue]);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, currentValue - 1);
    onValueChange([newValue]);
  };

  // Handle keyboard shortcuts on input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm text-muted-foreground">{label}</Label>
      )}
      
      <div className="flex gap-2 items-center">
        <Slider
          value={value}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="flex-1 min-w-0"
        />
        
        {/* Input with up/down buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Input
            type="number"
            min={min}
            max={max}
            value={currentValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-14 sm:w-16 h-9 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          
          {/* Up/Down buttons */}
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleIncrement}
              disabled={currentValue >= max}
              className="h-[18px] sm:h-4 w-7 sm:w-6 p-0 rounded-sm touch-manipulation"
              aria-label="Increment value"
            >
              <ChevronUp className="size-3" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDecrement}
              disabled={currentValue <= min}
              className="h-[18px] sm:h-4 w-7 sm:w-6 p-0 rounded-sm touch-manipulation"
              aria-label="Decrement value"
            >
              <ChevronDown className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Label indicators */}
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
