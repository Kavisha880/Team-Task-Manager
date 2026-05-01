const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  "in-progress": "bg-blue-100 text-blue-700",
  review: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  "on-hold": "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

interface BadgeProps {
  value: string;
  type?: "status" | "priority";
}

export default function Badge({ value, type = "status" }: BadgeProps) {
  const colors = type === "priority" ? priorityColors : statusColors;
  const cls = colors[value] || "bg-gray-100 text-gray-600";
  const label = value.replace(/-/g, " ");
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {label}
    </span>
  );
}
