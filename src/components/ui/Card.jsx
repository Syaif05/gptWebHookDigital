export function Card({ className = "", children }) {
  return <div className={`card ${className}`}>{children}</div>;
}
export function CardHeader({ className = "", children }) {
  return (
    <div className={`px-5 pt-5 pb-3 border-b ${className}`}>{children}</div>
  );
}
export function CardBody({ className = "", children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
