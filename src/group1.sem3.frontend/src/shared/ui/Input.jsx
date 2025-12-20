export default function Input({ id, value, onChange, type = "text", placeholder = "", className = "", min, max, step, checked = "", required = false }) {
    const base = "w-full px-3 py-2 rounded border border-secondary outline-none focus:ring-2 focus:ring-accent bg-background text-primary";
    return (
        <input
            id={id}
            value={value}
            onChange={onChange}
            type={type}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`${base} ${className}`}
            checked={checked}
            required={required}
        />
    );
}
