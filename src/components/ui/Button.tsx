interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

function Button({
  children,
  className,
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`cursor-pointer ${
        fullWidth ? "flex" : "inline-flex"
      } justify-center items-center gap-3 py-2 px-4 rounded-md font-medium text-md bg-slate-300 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
