const TextField = ({
  label,
  id,
  type,
  errors,
  register,
  required,
  message,
  className,
  min,
  placeholder,
}) => {
  const hasError = Boolean(errors[id]?.message);

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={id} className="lx-label">
        {label}
      </label>

      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className={`lx-input ${hasError ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgb(239_68_68/0.2)] dark:border-red-400" : ""}`}
        {...register(id, {
          required: required ? message : false,
          minLength: min
            ? { value: min, message: "Minimum 6 characters are required" }
            : undefined,
          pattern:
            type === "email"
              ? {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                }
              : type === "url"
                ? {
                    value:
                      /^(https?:\/\/)?(([a-zA-Z0-9\u00a1-\uffff-]+\.)+[a-zA-Z\u00a1-\uffff]{2,})(:\d{2,5})?(\/[^\s]*)?$/,
                    message: "Please enter a valid URL",
                  }
                : undefined,
        })}
      />

      {hasError ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {errors[id]?.message}
        </p>
      ) : null}
    </div>
  );
};

export default TextField;
