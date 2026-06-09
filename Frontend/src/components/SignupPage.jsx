import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import toast from "react-hot-toast";

const SignupPage = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const submitLock = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
    mode: "onTouched",
  });

  const password = watch("password");

  const onRegister = async (data) => {
    if (submitLock.current) return;
    if (!data.agreeTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    submitLock.current = true;
    setLoader(true);
    try {
      // Exclude confirmPassword and agreeTerms from API request
      const requestPayload = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: ["user"],
      };

      await api.post("/api/auth/public/register", requestPayload);
      toast.success("Account created successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed. Try again.");
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

        <h2 className="text-[28px] font-display font-bold text-white tracking-tight text-center mb-2">
          Create your account.
        </h2>
        <p className="text-[14px] text-[#A0A0A0] text-center mb-8">
          Start shortening links for free
        </p>

        <form onSubmit={handleSubmit(onRegister)} className="space-y-5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              className="input"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <span className="text-[12px] text-[#FF4D4D]">{errors.username.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z0-9]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <span className="text-[12px] text-[#FF4D4D]">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Password
            </label>
            <input
              type="password"
              placeholder="Choose a secure password"
              className="input"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <span className="text-[12px] text-[#FF4D4D]">{errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-[0.15em] text-[#4DFFB4] uppercase">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="input"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <span className="text-[12px] text-[#FF4D4D]">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-2.5 mt-2">
            <input
              id="agreeTerms"
              type="checkbox"
              className="mt-1 accent-[#4DFFB4] cursor-pointer"
              {...register("agreeTerms", { required: true })}
            />
            <label htmlFor="agreeTerms" className="text-[12px] text-[#A0A0A0] leading-snug cursor-pointer select-none">
              I agree to the{" "}
              <a href="/privacy" className="text-[#4DFFB4] hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/terms" className="text-[#4DFFB4] hover:underline">
                Terms of Service
              </a>
              .
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loader}
            className="btn-primary w-full py-3.5 text-center mt-4"
          >
            {loader ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-[14px] text-[#A0A0A0] mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4DFFB4] hover:text-[#3DE8A0] font-semibold transition-colors duration-150">
            Login →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
