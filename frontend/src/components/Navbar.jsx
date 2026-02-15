import { useState } from "react";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FIXED NAVBAR */}
      <nav className="
        fixed 
        top-0 left-0 
        w-full 
        flex justify-between items-center 
        px-8 md:px-16 py-4 
        z-50
        bg-[#0d0620]/80 
        backdrop-blur-xl 
        border-b border-white/10
      ">

        {/* Logo */}
        <div className="text-white font-semibold text-xl">
          TA
        </div>

        {/* Concept Badge */}
        <div className="hidden md:block border text-white border-white px-4 py-1 rounded-full text-xs tracking-wider">
          CONCEPT
        </div>

        {/* Hamburger */}
        <div
          onClick={() => setOpen(true)}
          className="space-y-1 cursor-pointer"
        >
          <span className="block w-6 h-[2px] bg-white"></span>
          <span className="block w-6 h-[2px] bg-white"></span>
          <span className="block w-6 h-[2px] bg-white"></span>
        </div>
      </nav>

      {open && <MobileMenu close={() => setOpen(false)} />}
    </>
  );
}
