import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";
import { useStoreContext } from "../contextApi/ContextApi";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const submitLock = useRef(false);
  const { setToken } = useStoreContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onLogin = async (data) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setLoader(true);
    try {
      const { data: response } = await api.post("/api/auth/public/login", data);
      setToken(response.token);
      localStorage.setItem("JWT_TOKEN", JSON.stringify(response.token));
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoader(false);
      submitLock.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] bg-[#0F0F0F] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 md:p-12">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-[18px] text-white">
            <svg className="w-4 h-4 text-[#4DFFB4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
            </svg>
            <span>LYNKFORGE</span>
          </Link>
        </div>

        <h2 className="text-[32px] font-display font-bold text-white tracking-tight text-center mb-2">
          Welcome back.
        </h2>
        <p className="text-[14px] text-[#A0A0A0] text-center mb-8">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit(onLogin)} className="space-y-6">
          {/* Username / Email field */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Username or Email
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="input"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <span className="text-[12px] text-[#FF4D4D]">{errors.username.message}</span>
            )}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
                Password
              </label>
              <Link to="/forgot-password" className="text-[12px] text-[#4DFFB4] hover:text-[#3DE8A0] transition-colors duration-150">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              className="input"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <span className="text-[12px] text-[#FF4D4D]">{errors.password.message}</span>
            )}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loader}
            className="btn-primary w-full py-3.5 text-center mt-4"
          >
            {loader ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-[rgba(255,255,255,0.06)]" />
          <span className="relative z-10 px-4 bg-[#0F0F0F] text-[12px] text-[#525252] uppercase tracking-[0.12em]">
            or
          </span>
        </div>

        {/* GitHub Button */}
        <button
          type="button"
          onClick={() => toast.success("GitHub OAuth login simulated")}
          className="btn-ghost w-full py-3.5 flex items-center justify-center gap-2 border-[rgba(255,255,255,0.08)] text-white hover:text-[#4DFFB4]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
          </svg>
          Sign in with GitHub
        </button>

        {/* Footer Link */}
        <p className="text-center text-[14px] text-[#A0A0A0] mt-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#4DFFB4] hover:text-[#3DE8A0] font-semibold transition-colors duration-150">
            Sign up →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
