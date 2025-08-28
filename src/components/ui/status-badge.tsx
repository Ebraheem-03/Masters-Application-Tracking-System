import { Badge } from "@/components/ui/badge";
import type { Status } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  PLANNING: { label: 'Planning', variant: 'secondary' as const },
  ELIGIBLE: { label: 'Eligible', variant: 'secondary' as const },
  APPLIED: { label: 'Applied', variant: 'default' as const },
  SUBMITTED: { label: 'Submitted', variant: 'default' as const },
  INTERVIEW: { label: 'Interview', variant: 'default' as const },
  OFFER: { label: 'Offer', variant: 'default' as const },
  WAITLISTED: { label: 'Waitlisted', variant: 'secondary' as const },
  REJECTED: { label: 'Rejected', variant: 'destructive' as const },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn(
        "font-medium",
        status === 'OFFER' && "bg-success text-success-foreground hover:bg-success/80",
        status === 'WAITLISTED' && "bg-warning text-warning-foreground hover:bg-warning/80",
        className
      )}
    >
      {config.label}
    </Badge>
  );
}