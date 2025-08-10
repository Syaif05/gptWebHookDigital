export default function Button({
  as: Comp = "button",
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4",
    lg: "h-12 px-6 text-lg",
  };
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700",
    secondary: "bg-white border hover:bg-slate-50",
    ghost: "hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const C = Comp;
  return (
    <C
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
