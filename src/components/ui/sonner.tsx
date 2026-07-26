"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

const Toaster = ({ className, toastOptions, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className={cn("toaster group", className)}
      duration={3000}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "oklch(0.97 0.02 155)",
          "--success-border": "oklch(0.88 0.04 155)",
          "--success-text": "oklch(0.35 0.08 155)",
          "--error-bg": "oklch(0.97 0.02 25)",
          "--error-border": "oklch(0.88 0.05 25)",
          "--error-text": "oklch(0.42 0.14 25)",
          "--info-bg": "var(--popover)",
          "--info-border": "var(--border)",
          "--info-text": "var(--popover-foreground)",
          "--warning-bg": "oklch(0.97 0.03 85)",
          "--warning-border": "oklch(0.9 0.05 85)",
          "--warning-text": "oklch(0.4 0.08 70)",
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            "cn-toast group-[.toaster]:border group-[.toaster]:shadow-md group-[.toaster]:text-sm",
          title: "group-[.toaster]:text-sm group-[.toaster]:font-medium",
          description:
            "group-[.toaster]:text-xs group-[.toaster]:opacity-90",
          actionButton:
            "group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:text-xs group-[.toaster]:font-medium",
          cancelButton:
            "group-[.toaster]:bg-muted group-[.toaster]:text-muted-foreground group-[.toaster]:text-xs",
          closeButton: "group-[.toaster]:border-border",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
