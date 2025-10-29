import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="p-6 glass border-border hover:shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-105">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
};
