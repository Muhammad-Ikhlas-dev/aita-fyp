import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import SignupForm from "./SignupForm";

// Assets
import shapeTopBlue from "../../assets/shape-top-blue.png";
import shapeRightPurple from "../../assets/shape-right-purple.png";
import shapeSmallBlob1 from "../../assets/shape-small-blob-1.png";
import shapeSmallBlob2 from "../../assets/shape-small-blob-2.png";
import shapeBottomLeft from "../../assets/shape-bottom-left.png";
import shapeZigzag from "../../assets/shape-zigzag.png";
import glow from "../../assets/glow.png";
import {useNavigate} from "react-router-dom";

// Schema
const schema = (role) =>
  z.object({
    fullName: z.string().min(2, "Full name is required").max(255),
    rollNo: role === "student" ? z.string().min(1, "Roll number required") : z.string().optional(),
    email: z.email("Valid email is required."),
    password: z.string().min(6, "Minimum 6 characters"),
    role: z.enum(["student", "teacher"], { required_error: "Select role" }),
  });

export default function SignupContainer() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema(role)),
  });

  // Event: submit signup form — API POST /api/auth/signup; on success redirect to signin
  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      };
      if (data.role === "student" && data.rollNo) {
        payload.rollNo = data.rollNo;
      }
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        setSubmitError(result.message || "Signup failed");
        return;
      }
      console.log("Signup success:", result.user);
      alert(result.message || "Account created successfully.");
      navigate("/signin");
    } catch (err) {
      console.error("Signup error:", err);
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-2 relative min-h-screen w-full bg-gradient-to-b from-[#0a001a] via-[#1a0033] to-[#0f0020] flex items-center justify-center overflow-hidden text-white font-inter">
      {/* Glow and shapes */}
      <img src={glow} className="absolute z-10 w-[300px] sm:w-[420px] md:w-[520px] lg:w-[720px] xl:w-[880px] pointer-events-none select-none animate-pulse" />
      <img src={shapeTopBlue} className="absolute top-2 left-1/2 -translate-x-1/2 w-40 opacity-80" />
      <img src={shapeRightPurple} className="absolute right-8 top-32 w-52 opacity-70" />
      <img src={shapeSmallBlob1} className="absolute left-10 top-1/3 w-20 opacity-70" />
      <img src={shapeSmallBlob2} className="absolute left-20 top-[55%] w-16 opacity-60" />
      <img src={shapeBottomLeft} className="absolute bottom-1 left-1 w-52 opacity-60" />
      <img src={shapeZigzag} className="absolute bottom-20 right-16 w-20 opacity-70" />

      <div className="relative z-20 w-[500px] sm:w-[600px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-10 flex flex-col gap-6">
        {submitError && (
          <p className="text-red-400 text-sm text-center bg-red-900/20 px-3 py-2 rounded-lg">{submitError}</p>
        )}
        <SignupForm
          role={role}
          setRole={setRole}
          register={register}
          errors={errors}
          setValue={setValue}
          handleSubmit={handleSubmit(onSubmit)}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
