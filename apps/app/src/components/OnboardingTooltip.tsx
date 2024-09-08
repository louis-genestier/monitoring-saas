import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { useState } from "react";

interface OnboardingTooltipProps {
  content: string;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  content,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild onClick={() => setIsOpen(true)}>
          <span className="cursor-help">
            <InfoIcon className="w-4 h-4 text-accent ml-2" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
