import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick?: () => void;
    };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    {description && (
                        <p className="text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {action && (
                    <Button onClick={action.onClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        {action.label}
                    </Button>
                )}
            </div>
            <Separator />
        </div>
    );
}
