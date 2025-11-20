const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) => {
  const baseStyles =
    "font-bold rounded-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variants = {
    primary:
      "bg-primary hover:bg-secondary text-white shadow-md hover:shadow-lg hover:scale-105",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
