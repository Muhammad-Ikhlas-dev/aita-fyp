import { inputClass, buttonClass } from "./constants";

export default function LoginForm({ register, errors, handleSubmit, submitting = false }) {
  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

      {/* Email */}
      <div className="flex flex-col">
        <label className="text-white font-medium text-sm mb-1">Email</label>
        <input
          {...register("email")}
          type="email"
          placeholder="username@gmail.com"
          className={inputClass}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col">
        <label className="text-white font-medium text-sm mb-1">Password</label>
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className={inputClass}
        />
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <button type="submit" className={buttonClass} disabled={submitting}>
        {submitting ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}
