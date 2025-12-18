export default function Button({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }) {
 const base = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none";
 const variants = {
 primary: "bg-accent text-white hover:bg-accent/90",
 secondary: "bg-primary text-white hover:bg-primary/90",
 ghost: "bg-white text-primary hover:bg-secondary/10",
 danger: "bg-red-500 text-white hover:bg-red-600",
 disabled: "bg-gray-300 text-gray-600 cursor-not-allowed",
 };

 const vclass = disabled ? variants.disabled : (variants[variant] ?? variants.primary);
 return (
 <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${vclass} ${className}`}>
 {children}
 </button>
 );
}
