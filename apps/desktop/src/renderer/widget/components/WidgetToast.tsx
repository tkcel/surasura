import React from "react";
import { X } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WidgetToastProps {
  title: string;
  description: string;
  onDismiss?: () => void;
}

export const WidgetToast: React.FC<WidgetToastProps> = ({
  title,
  description,
  onDismiss,
}) => {
  return (
    <Card className="relative min-w-[300px] gap-3 py-4 shadow-none">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-sm p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <CardHeader className="gap-1 px-4 py-0 pr-8">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};
