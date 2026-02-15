import { Flame } from 'lucide-react';
import GlobeAsset from '../assets/globe.svg';
import GlowAsset from '../assets/glow.png'; // import your glow.png

const SidebarIcon1 = "https://cdn.jsdelivr.net/gh/lucide-icons/lucide/icons/code-2.svg"; 
const SidebarIcon2 = "https://cdn.jsdelivr.net/gh/lucide-icons/lucide/icons/briefcase.svg"; 
const SidebarIcon3 = "https://cdn.jsdelivr.net/gh/lucide-icons/lucide/icons/lock.svg"; 

const HeroSection = () => {
  return (
    <div className="relative min-h-[350px] sm:min-h-screen w-full bg-[#0d0620] text-white overflow-hidden font-sans selection:bg-purple-500 selection:text-white flex flex-col">

      {/* CENTERED BACKGROUND GLOW */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <img src={GlowAsset} alt="Glow Background" className="w-[800px] sm:w-[1200px] md:w-[1500px] opacity-30" />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-900/30 blur-[120px] rounded-full pointer-events-none" />
      
      {/* SIDEBAR */}
      <div className="absolute left-0 top-0 bottom-0 w-32 hidden md:flex flex-col z-20 pointer-events-none">
        {/* TOP */}
        <div className="relative flex-1 w-full">
          <div className="absolute right-[60px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#4ade80] via-purple-900 to-purple-900 shadow-[0_0_15px_rgba(168,85,247,0.8)] opacity-80"></div>

          <div className="absolute bottom-[20%] right-[42px] pointer-events-auto cursor-pointer group">
            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-0 group-hover:opacity-100 group-hover:blur-2xl transition duration-500"></div>

            <div className="relative w-10 h-10 bg-[#1a103c] border border-purple-400/40 rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:shadow-[0_0_35px_rgba(168,85,247,0.9)] transition duration-500 p-2">
               <img src={SidebarIcon1} alt="Code" className="w-full h-full object-contain invert opacity-80 group-hover:opacity-100 transition" />
            </div>
          </div>
        </div>

        {/* CURVE */}
        <div className="relative h-[200px] w-full shrink-0">
          <svg className="absolute top-0 left-0 w-full h-full overflow-visible" viewBox="0 0 128 200" preserveAspectRatio="none">
             <path d="M 68 0 C 68 60, 108 80, 108 100 C 108 120, 68 140, 68 200" fill="none" stroke="#4ade80" strokeWidth="8" className="opacity-60 blur-md" />
             <path d="M 68 0 C 68 60, 108 80, 108 100 C 108 120, 68 140, 68 200" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <div className="absolute top-1/2 left-[108px] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group">
            <div className="absolute inset-0 bg-green-500 blur-lg opacity-40 group-hover:opacity-80 transition duration-500"></div>

            <div className="relative w-10 h-10 bg-[#0d1f18] border border-green-500/50 rounded-lg flex items-center justify-center z-10 shadow-[0_0_20px_rgba(74,222,128,0.3)] p-2">
              <img src={SidebarIcon2} alt="Briefcase" className="w-full h-full object-contain invert-[0.2] sepia saturate-200 hue-rotate-50" />
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="relative flex-1 w-full">
           <div className="absolute right-[60px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#4ade80] via-purple-900 to-purple-900 shadow-[0_0_15px_rgba(74,222,128,0.4)] opacity-80"></div>

           <div className="absolute top-[20%] right-[42px] pointer-events-auto cursor-pointer group">
            <div className="absolute inset-0 bg-purple-500/70 blur-xl opacity-0 group-hover:opacity-100 group-hover:blur-2xl transition duration-500"></div>

            <div className="relative w-10 h-10 bg-[#1a103c] border border-gray-700/50 rounded-full flex items-center justify-center z-10 opacity-70 group-hover:opacity-100 transition shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:shadow-[0_0_35px_rgba(168,85,247,0.9)] duration-500 p-2">
               <img src={SidebarIcon3} alt="Lock" className="w-full h-full object-contain invert opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main
        className="relative z-10 flex flex-col items-center justify-start text-center px-4 
        mt-4 sm:mt-8 md:mt-20 lg:mt-28 
        pb-24 sm:pb-32"
      >

        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl leading-[1.1] md:leading-[1.15]">
          Boost your teaching game with <br className="hidden md:block"/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8ba1ff] via-[#b696ff] to-[#ff9bc4]">
            our smart AI assistant.
          </span>
        </h1>

        <div className="mt-6 md:mt-12 group relative">
          <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-70 blur-sm group-hover:opacity-100 transition duration-200"></div>

          <button className="relative px-8 py-3 rounded-full bg-[#150a2e] flex items-center gap-2 text-white font-medium hover:bg-[#1f1140] transition shadow-2xl border border-white/10">
            Level Up Now 
            <span className="text-orange-500"><Flame className="w-4 h-4 fill-orange-500" /></span>
          </button>
        </div>
      </main>

      {/* GLOBE */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center z-0 pointer-events-none">
        <div className="relative w-full max-w-5xl h-[34vh] sm:h-[40vh] md:h-[55vh]">
          <img 
            src={GlobeAsset} 
            alt="AI Globe Network" 
            className="w-full h-full object-contain object-bottom scale-[1.15] sm:scale-[1.05] md:scale-100 opacity-90"
          />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0d0620] to-transparent"></div>
        </div>
      </div>

    </div>
  );
};

export default HeroSection;
