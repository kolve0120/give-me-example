interface StatCardProps {
  value: string;
  label: string;
}

export const StatCard = ({ value, label }: StatCardProps) => {
  return (
    <div className="text-center space-y-2 animate-fade-in">
      <div className="text-4xl md:text-5xl font-bold text-gradient">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
};
