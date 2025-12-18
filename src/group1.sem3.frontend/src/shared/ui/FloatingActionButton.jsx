import { Link } from "react-router-dom";

export default function FloatingActionButton({ to, onClick, children, disabled = false, state, className = "" }) {
 const base = "fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md py-4 rounded-2xl text-lg font-semibold shadow-lg z-10 block text-center";
 const enabledClass = "bg-accent text-white hover:bg-accent/90";
 const disabledClass = "bg-gray-300 text-gray-600 cursor-not-allowed";
 const finalClass = `${base} ${disabled ? disabledClass : enabledClass} ${className}`;

 if (to) {
     return (
         <Link to={to} state={state} className={finalClass} onClick={onClick} aria-disabled={disabled}>
         {children}
         </Link>
    );
 }

 return (
     <button disabled={disabled} onClick={onClick} className={finalClass}>
     {children}
     </button>  
 );
}
