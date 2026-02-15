import React from 'react';
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Instagram, 
  ArrowRight, 
  Send,
  Sparkles 
} from 'lucide-react';

const FooterSection = () => {
  return (
    <footer className="relative w-full bg-[#0d0620] text-white overflow-hidden font-sans pt-20 pb-10">
      
      {/* --- Ambient Background Glows --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-cyan-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* ================= TOP CTA SECTION ================= */}
        <div className="flex flex-col items-center text-center mb-24">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-300">Join the Education Revolution</span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight max-w-4xl">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">Transform</span> <br />
            Your Classroom?
          </h2>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Stop spending hours on grading and paperwork. Let our AI agent handle the boring stuff so you can focus on inspiring your students.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="group relative px-8 py-4 bg-white text-black font-bold rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-transparent border border-gray-700 text-white font-semibold rounded-full hover:bg-white/5 hover:border-gray-500 transition-all duration-300">
              Book a Demo
            </button>
          </div>
        </div>


        {/* ================= DIVIDER ================= */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-16"></div>


        {/* ================= FOOTER LINKS AREA ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Column 1: Brand Info (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center font-bold text-white">A</div>
              <span className="text-2xl font-bold tracking-tight">AI Teacher</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm pr-4">
              Empowering educators with next-generation AI tools. We believe technology should serve teachers, not replace them.
            </p>
            {/* Newsletter Input */}
            <div className="relative mt-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-white/5 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Column 2: Platform (Span 2) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-bold text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Column 3: Company (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Column 4: Legal (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
            </ul>
          </div>

        </div>


        {/* ================= BOTTOM BAR ================= */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800/50">
          
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} AI Teacher Inc. All rights reserved.
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <SocialLink icon={<Twitter className="w-5 h-5" />} />
            <SocialLink icon={<Github className="w-5 h-5" />} />
            <SocialLink icon={<Linkedin className="w-5 h-5" />} />
            <SocialLink icon={<Instagram className="w-5 h-5" />} />
          </div>

        </div>

      </div>
    </footer>
  );
};

// Helper for Social Icons
const SocialLink = ({ icon }) => (
  <a 
    href="#" 
    className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-200"
  >
    {icon}
  </a>
);

export default FooterSection;