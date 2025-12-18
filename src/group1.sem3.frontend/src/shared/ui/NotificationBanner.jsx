export default function NotificationBanner({ children, type = "info" }) {
 const base = "mb-4 px-3 py-2 rounded";
 const typeClass = type === "success" ? "bg-green-100 text-green-800" : type === "error" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800";
 return <div className={`${base} ${typeClass}`}>{children}</div>;
}
