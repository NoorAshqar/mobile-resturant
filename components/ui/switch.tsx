"use client"

import * as React from "react"
import { cn } from "@/components/ui/utils"

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, checked, defaultChecked, disabled, ...props }, ref) => {
  const isChecked = checked ?? defaultChecked ?? false

  return (
    <label
      className={cn(
        "relative inline-flex items-center",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        {...props}
      />
      <div
        aria-hidden="true"
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-200 dark:peer-focus:ring-emerald-900 peer-checked:bg-emerald-500 peer-checked:dark:bg-emerald-400",
          isChecked
            ? "bg-emerald-500 dark:bg-emerald-400"
            : "bg-neutral-300 dark:bg-neutral-700",
          disabled && "bg-neutral-200 dark:bg-neutral-800",
          className,
        )}
      >
        <span
          className={cn(
            "absolute left-[2px] top-[2px] block h-5 w-5 rounded-full border border-neutral-300 bg-white shadow transition-transform peer-checked:translate-x-5",
            isChecked ? "translate-x-5" : "translate-x-0",
            disabled && "bg-neutral-100",
          )}
        />
      </div>
    </label>
  )
})
Switch.displayName = "Switch"

export { Switch }
