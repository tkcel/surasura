"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer bg-nm-surface shadow-nm-inset-sm data-[state=checked]:bg-emerald-500 focus-visible:ring-ring/50 inline-flex h-[1.25rem] w-9 shrink-0 items-center rounded-full transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 border-0 dark:bg-muted dark:shadow-nm-inset-md dark:data-[state=checked]:bg-emerald-600",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-muted-foreground shadow-nm-raised-sm pointer-events-none block size-4 rounded-full ring-0 transition-transform duration-200 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0.5 data-[state=checked]:bg-white data-[state=checked]:shadow-nm-raised-sm dark:data-[state=unchecked]:bg-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
