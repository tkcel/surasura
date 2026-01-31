import React from "react";
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
}

export const WidgetToast: React.FC<WidgetToastProps> = ({
  title,
  description,
  primaryAction,
  onActionClick,
}) => {
  return (
    <Card className="min-w-[300px] gap-3 py-4 shadow-lg">
      <CardHeader className="gap-1 px-4 py-0">
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
