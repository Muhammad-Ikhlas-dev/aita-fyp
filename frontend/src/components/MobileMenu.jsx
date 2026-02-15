import { NavbarLinks } from "../data/Navbar.data";
import { Link } from "react-router-dom";

export default function MobileMenu({ close }) {
  return (
    <div
      className="
      fixed inset-0 z-50
      bg-gradient-to-b from-[#050A2F] via-[#070E3D] to-[#050A2F]
      text-white flex flex-col
      animate-[fadeIn_0.25s_ease-out]
    "
    >
      {/* CLOSE BUTTON */}
      <div className="flex justify-end p-6">
        <button
          onClick={close}
          className="
            w-12 h-12 flex items-center justify-center
            rounded-full border border-white/20
            text-2xl
            hover:bg-white/10
            hover:scale-110 active:scale-95
            transition-all duration-200
            shadow-[0_0_15px_rgba(255,255,255,0.25)]
          "
        >
          ✕
        </button>
      </div>

      {/* MENU LINKS */}
      <div className="flex flex-1 flex-col justify-center items-center gap-10">
        {NavbarLinks?.map(({ to, routeName }, index) => (
          <Link
            key={index}
            to={to}
            onClick={close}
            className="
      group relative
      text-3xl sm:text-4xl font-semibold tracking-wide
      transition-all duration-200
      hover:text-purple-400 active:scale-95
    "
          >
            {/* TEXT */}
            <span className="relative z-10">{routeName}</span>

            {/* UNDERLINE */}
            <span
              className="
        absolute left-1/2 bottom-[-6px]
        w-0 h-[2px]
        bg-gradient-to-r from-purple-400 to-pink-500
        transition-all duration-300
        group-hover:w-full group-hover:left-0
      "
            ></span>

            {/* GLOW EFFECT */}
            <span
              className="
        absolute inset-0
        bg-purple-500/10 blur-2xl opacity-0
        group-hover:opacity-100
        transition duration-300
        -z-10
      "
            ></span>
          </Link>
        ))}
      </div>

      {/* FOOTER LINE */}
      <div
        className="
        py-6 text-center text-xs text-white/40 tracking-widest
      "
      >
        AI TEACHER ASSISTANCE
      </div>

      {/* KEYFRAMES */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
