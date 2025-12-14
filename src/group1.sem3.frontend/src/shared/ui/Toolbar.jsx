export default function Toolbar({ children, className = "" }) {
 return (
 <div className={`flex items-center gap-3 ${className}`}>
 {children}
 </div>
 );
}
