export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-primary/30 ${
        props.className || ""
      }`}
    />
  );
}
export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-primary/30 ${
        props.className || ""
      }`}
    />
  );
}
export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border px-3 py-2 bg-white ${
        props.className || ""
      }`}
    />
  );
}
