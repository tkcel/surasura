import React from "react";
import { X } from "lucide-react";
import type { WidgetNotificationAction } from "@/types/widget-notification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WidgetToastProps {
  title: string;
  description: string;
  primaryAction?: WidgetNotificationAction;
  onActionClick: (action: WidgetNotificationAction) => void;
  onDismiss?: () => void;
}

export const WidgetToast: React.FC<WidgetToastProps> = ({
  title,
  description,
  primaryAction,
  onActionClick,
  onDismiss,
}) => {
  return (
    <Card className="relative min-w-[300px] gap-3 py-4 shadow-lg">
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

      <CardFooter className="gap-2 px-4 py-0">
        {primaryAction && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onActionClick(primaryAction)}
          >
            {primaryAction.label}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
