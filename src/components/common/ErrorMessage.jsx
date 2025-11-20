const ErrorMessage = ({ message, type = "error", onClose }) => {
  const types = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-600",
      icon: "bi-exclamation-circle",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      icon: "bi-exclamation-triangle",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-600",
      icon: "bi-check-circle",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      icon: "bi-info-circle",
    },
  };

  const style = types[type];

  if (!message) return null;

  return (
    <div
      className={`${style.bg} border ${style.border} ${style.text} px-4 py-3 rounded-lg flex items-center justify-between`}
    >
      <div className="flex items-center">
        <i className={`bi ${style.icon} mr-2`}></i>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 hover:opacity-70 transition-opacity"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
