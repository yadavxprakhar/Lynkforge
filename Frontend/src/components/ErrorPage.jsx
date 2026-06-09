import { useNavigate } from "react-router-dom";
import { useStoreContext } from "../contextApi/ContextApi";

const ErrorPage = ({ message, variant = "generic" }) => {
  const navigate = useNavigate();
  const { token } = useStoreContext();

  const title = variant === "notFound" ? "Link not found." : "Something went wrong.";
  const body = message ?? (variant === "notFound"
    ? "This link may have been deleted or never existed."
    : "An unexpected error occurred. Please try again later.");

  const handleBack = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080808] flex items-center justify-center overflow-hidden px-6">
      {/* Large 404 Watermark background */}
      <div className="absolute font-display font-extrabold text-[120px] md:text-[200px] text-[#4DFFB4]/5 leading-none select-none z-0">
        {variant === "notFound" ? "404" : "500"}
      </div>

      {/* Foreground overlay content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md gap-6">
        <h2 className="text-[36px] md:text-[48px] font-display font-bold text-white tracking-tight leading-none">
          {title}
        </h2>
        <p className="text-[15px] md:text-[16px] text-[#A0A0A0] leading-relaxed">
          {body}
        </p>
        <button
          onClick={handleBack}
          className="btn-primary mt-4 py-3.5 px-8 bg-[#4DFFB4] text-[#080808] hover:bg-[#3DE8A0] font-bold uppercase tracking-[0.08em]"
        >
          {token ? "← Back to Dashboard" : "Go Home"}
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
