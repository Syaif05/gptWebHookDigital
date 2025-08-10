export default function Badge({ children, tone = "neutral" }) {
  const map = {
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    warn: "bg-amber-100 text-amber-800",
    neutral: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs ${map[tone]}`}
    >
      {children}
    </span>
  );
}
