import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FORMATTING_VARIABLES,
  FORMATTING_VARIABLE_PATTERN,
  type FormattingVariableKey,
} from "../constants/formatting-variables";

interface InstructionsDisplayProps {
  value: string;
  onClick?: () => void;
  className?: string;
}

export function InstructionsDisplay({
  value,
  onClick,
  className,
}: InstructionsDisplayProps) {
  const segments = value.split(FORMATTING_VARIABLE_PATTERN);

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex field-sizing-content w-full rounded-xl bg-nm-surface px-3 py-2 text-base shadow-nm-inset-sm transition-all duration-200 md:text-sm border-0",
        "cursor-text whitespace-pre-wrap",
        "hover:shadow-nm-inset-md",
        className
      )}
    >
      <div className="flex-1">
        {segments.map((segment, index) => {
          const variableInfo = FORMATTING_VARIABLES[segment as FormattingVariableKey];

          if (variableInfo) {
            return (
              <Badge
                key={index}
                variant="secondary"
                className={cn(
                  "mx-0.5 px-1.5 py-0.5 text-xs font-normal inline-flex align-baseline",
                  variableInfo.colorClass
                )}
              >
                {variableInfo.label}
              </Badge>
            );
          }

          return <span key={index}>{segment}</span>;
        })}
        {!value && (
          <span className="text-muted-foreground">
            例: 文末は「です・ます」調に統一してください。専門用語は英語のまま残してください。
          </span>
        )}
      </div>
    </div>
  );
}
