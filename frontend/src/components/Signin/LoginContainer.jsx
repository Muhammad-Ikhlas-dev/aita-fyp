import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import LoginForm from "./LoginForm";

// ASSETS
import shapeTopBlue from "../../assets/shape-top-blue.png";
import shapeRightPurple from "../../assets/shape-right-purple.png";
import shapeSmallBlob1 from "../../assets/shape-small-blob-1.png";
import shapeSmallBlob2 from "../../assets/shape-small-blob-2.png";
import shapeBottomLeft from "../../assets/shape-bottom-left.png";
import shapeZigzag from "../../assets/shape-zigzag.png";
import glow from "../../assets/glow.png";
import { Link } from "react-router-dom";

// Schema
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

const API_BASE = "http://localhost:5000/api";

export default function LoginContainer() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || "Login failed");
        return;
      }
      localStorage.setItem("user", JSON.stringify(result.user));
      if (result.user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-2 relative min-h-screen w-full bg-gradient-to-b from-[#0a001a] via-[#1a0033] to-[#0f0020] flex items-center justify-center overflow-hidden text-white font-inter">

      {/* Glow */}
      <img src={glow} alt="Glow" className="absolute z-10 w-[300px] sm:w-[420px] md:w-[520px] lg:w-[720px] xl:w-[880px] pointer-events-none select-none animate-pulse" />

      {/* Shapes */}
      <img src={shapeTopBlue} className="absolute top-2 left-1/2 -translate-x-1/2 w-40 opacity-80" />
      <img src={shapeRightPurple} className="absolute right-8 top-32 w-52 opacity-70" />
      <img src={shapeSmallBlob1} className="absolute left-10 top-1/3 w-20 opacity-70" />
      <img src={shapeSmallBlob2} className="absolute left-20 top-[55%] w-16 opacity-60" />
      <img src={shapeBottomLeft} className="absolute bottom-1 left-1 w-52 opacity-60" />
      <img src={shapeZigzag} className="absolute bottom-20 right-16 w-20 opacity-70" />

      {/* Card */}
      <div className="relative z-20 w-[450px] sm:w-[500px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-10 flex flex-col gap-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 text-center">Sign In</h1>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
        )}

        <LoginForm
          register={register}
          errors={errors}
          handleSubmit={handleSubmit(onSubmit)}
          submitting={submitting}
        />

        <p className="text-center text-white/70 text-sm mt-4">
          Don’t have an account yet?{" "}
          <Link to="/signup" className="text-[#9B37FF] font-semibold hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
}
