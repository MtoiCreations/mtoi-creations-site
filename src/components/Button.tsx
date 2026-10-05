import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Rayon de 4 px et police des titres : DIRECTION-VISUELLE.md, section 5
    const baseStyles =
      "inline-flex items-center justify-center font-titre font-medium transition-colors duration-200 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-framboise focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      // Aplat safran, texte encre (jamais de texte clair sur safran)
      primary: "bg-safran text-encre hover:bg-safran/90",
      secondary: "bg-encre text-fond hover:bg-encre/90",
      outline:
        "border border-framboise text-framboise hover:bg-framboise hover:text-fond",
      ghost: "text-encre hover:bg-encre/10",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
