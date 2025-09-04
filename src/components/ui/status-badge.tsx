import { Badge } from "@/components/ui/badge";
import type { Status } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  Draft: { 
    label: 'Draft', 
    variant: 'secondary' as const,
    icon: '📝',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
  },
  'In Progress': { 
    label: 'In Progress', 
    variant: 'default' as const,
    icon: '🔄',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
  },
  Submitted: { 
    label: 'Submitted', 
    variant: 'default' as const,
    icon: '📤',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200'
  },
  Accepted: { 
    label: 'Accepted', 
    variant: 'default' as const,
    icon: '✅',
    className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
  },
  Rejected: { 
    label: 'Rejected', 
    variant: 'destructive' as const,
    icon: '❌',
    className: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) {
    // Fallback for unknown status
    return (
      <Badge variant="outline" className={cn("font-medium", className)}>
        ❓ {status}
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium transition-colors duration-200 border-0",
        config.className,
        className
      )}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}