import { inputClass, roleButtonClass, nextButtonClass } from "./constants";

export default function SignupForm({ role, setRole, register, errors, setValue, handleSubmit, submitting = false }) {
  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 text-center">Sign Up</h1>

      <input {...register("fullName")} type="text" placeholder="Full Name" className={inputClass} />
      {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}

      {role === "student" && (
        <input {...register("rollNo")} type="text" placeholder="Roll No" className={inputClass} />
      )}
      {errors.rollNo && <p className="text-red-400 text-xs">{errors.rollNo?.message}</p>}

      <input {...register("email")} type="email" placeholder="Email" className={inputClass} />
      {errors.email && <p className="text-red-400 text-xs">{errors.email?.message}</p>}

      <input {...register("password")} type="password" placeholder="Password" className={inputClass} />
      {errors.password && <p className="text-red-400 text-xs">{errors.password?.message}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => { setRole("student"); setValue("role", "student"); }}
          className={`${role === "student" ? "bg-[#9B37FF]" : "bg-white/20"} ${roleButtonClass}`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => { setRole("teacher"); setValue("role", "teacher"); }}
          className={`${role === "teacher" ? "bg-[#9B37FF]" : "bg-white/20"} ${roleButtonClass}`}
        >
          Teacher
        </button>
      </div>

      <button type="submit" className={nextButtonClass} disabled={submitting}>
        {submitting ? "Signing up…" : "Sign Up"}
      </button>
    </form>
  );
}
