import React from 'react';
import { Brain, Database, Shield, Cpu, ScanLine, GraduationCap, FileText, Bot } from 'lucide-react';

const FeaturesScreen = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#0d0620] text-white overflow-hidden font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* --- Background Ambient Glows & Assets --- */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-900/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />
      
      {/* --- Teal/Cyan Glowing Circles (Background decoration) --- */}
      <div className="absolute top-20 right-[10%] w-32 h-32 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[40%] left-[5%] w-24 h-24 bg-teal-500/20 blur-[50px] rounded-full pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-[40%] w-40 h-40 bg-cyan-600/10 blur-[60px] rounded-full pointer-events-none"></div>


      {/* --- Sidebar (Timeline) --- */}
      <div className="absolute left-0 top-0 bottom-0 w-32 hidden md:flex flex-col z-20 pointer-events-none">
        <div className="relative flex-1 w-full">
<div className="absolute right-[60px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-900 via-cyan-500 to-purple-900 
                shadow-[0_0_10px_rgba(6,182,212,0.8),0_0_20px_rgba(6,182,212,0.6),0_0_40px_rgba(6,182,212,0.4)] 
                opacity-90"></div>
           <div className="absolute top-[15%] right-[42px] pointer-events-auto cursor-pointer group">
            <div className="absolute inset-0 bg-cyan-500 blur-md opacity-50 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-10 h-10 bg-[#1a103c] border border-cyan-500/50 rounded-full flex items-center justify-center z-10 p-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
               <Cpu className="w-full h-full text-cyan-400" />
            </div>
          </div>
        </div>
      </div>


      {/* --- Main Content Area --- */}
      <main className="relative z-10 pl-0 md:pl-32 pr-4 py-16 flex flex-col h-full justify-center">
        
        {/* --- Top Section: Text and Holographic Interface --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col items-start text-left space-y-6 z-20">
            <span className="text-cyan-500 tracking-widest uppercase text-sm font-semibold pl-1">
              Features
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              We've created a <br />
              completely new <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                standard.
              </span>
            </h1>
            <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
              Our robot is designed to be the perfect assistant for your teaching needs. It's equipped with the latest AI technology and can be customized to fit your specific requirements.
            </p>
          </div>

          {/* Right Column: Creative Holographic Interface (Pure Code) */}
          <div className='hidden md:block'>
            <div className="relative w-full h-[500px] flex items-center justify-center perspective-1000">
            
            {/* 1. Radar Pulse Background */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-[300px] h-[300px] border border-cyan-500/20 rounded-full animate-ping opacity-20 duration-[3000ms]"></div>
               <div className="absolute w-[450px] h-[450px] border border-cyan-500/10 rounded-full"></div>
               <div className="absolute w-[600px] h-[600px] border border-purple-500/10 rounded-full"></div>
            </div>

            {/* 2. Central AI Core */}
            <div className="relative z-10 w-32 h-32 bg-gradient-to-b from-[#1a103c] to-[#0d0620] rounded-full border border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.4)] flex items-center justify-center">
               <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full animate-pulse"></div>
               <Bot className="w-16 h-16 text-cyan-200 drop-shadow-[0_0_10px_rgba(165,243,252,0.8)]" />
            </div>

            {/* 3. Floating Card: Scan Assignments (Top Left) */}
            <div className="absolute top-10 left-0 md:left-10 bg-[#150a2e]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl w-48 hover:scale-105 transition duration-300 animate-float-delayed">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-cyan-500/20 rounded-lg">
                   <ScanLine className="w-5 h-5 text-cyan-400" />
                 </div>
                 <div className="text-sm font-semibold text-white">Scan</div>
               </div>
               <p className="text-xs text-gray-400">Auto-extract text from assignments.</p>
            </div>

            {/* 4. Floating Card: Grading (Top Right) */}
            <div className="absolute top-20 right-0 md:right-10 bg-[#150a2e]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl w-44 hover:scale-105 transition duration-300 animate-float">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-purple-500/20 rounded-lg">
                   <GraduationCap className="w-5 h-5 text-purple-400" />
                 </div>
                 <div className="text-sm font-semibold text-white">Grading</div>
               </div>
               <p className="text-xs text-gray-400">Check and maintain grades accurately.</p>
            </div>

            {/* 5. Floating Card: Plagiarism Graph (Bottom Right) */}
            <div className="absolute bottom-0 right-0 md:right-0 bg-[#150a2e] border border-gray-700/50 p-5 rounded-3xl shadow-2xl w-64 md:w-72 hover:border-cyan-500/30 transition">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-white">Plagiarism</h4>
                    <div className="flex gap-4 mt-2">
                       <div>
                         <span className="block text-xs text-gray-500">Words</span>
                         <span className="text-sm font-bold text-cyan-400">23k</span>
                       </div>
                       <div>
                         <span className="block text-xs text-gray-500">Accuracy</span>
                         <span className="text-sm font-bold text-cyan-400">80%</span>
                       </div>
                    </div>
                  </div>
                  <FileText className="w-5 h-5 text-gray-600" />
               </div>
               
               {/* Decorative Graph Line */}
               <div className="h-16 w-full relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <path d="M0 40 Q 30 50, 60 30 T 120 40 T 180 20 T 200 10" fill="none" stroke="#22d3ee" strokeWidth="2" />
                    <path d="M0 40 Q 30 50, 60 30 T 120 40 T 180 20 T 200 10 V 60 H 0 Z" fill="url(#gradientGraph)" opacity="0.2" />
                    <defs>
                      <linearGradient id="gradientGraph" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Month Labels */}
                  <div className="flex justify-between text-[8px] text-gray-500 mt-1 uppercase tracking-wider">
                     <span>Jan</span><span>Feb</span><span className="text-cyan-400 font-bold bg-cyan-900/30 px-1 rounded">Mar</span><span>Apr</span><span>May</span>
                  </div>
               </div>
            </div>

          </div>
          </div>
        </div>


        {/* --- Bottom Section: Three Feature Cards --- */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
          
          {/* Card 1 */}
          <div className="bg-[#150a2e]/80 border border-white/5 p-8 rounded-3xl flex flex-col items-start space-y-4 backdrop-blur-sm hover:bg-[#1a103c] hover:border-cyan-500/30 transition duration-300 group">
            <div className="p-3 bg-cyan-900/30 rounded-xl group-hover:bg-cyan-500/20 transition">
              <Brain className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition" />
            </div>
            <h3 className="text-xl font-bold text-white">Advanced Algorithms</h3>
            <p className="text-gray-400 leading-relaxed">
              Powered by state-of-the-art machine learning to deeply understand and adapt to students' individual learning patterns.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#150a2e]/80 border border-white/5 p-8 rounded-3xl flex flex-col items-start space-y-4 backdrop-blur-sm hover:bg-[#1a103c] hover:border-cyan-500/30 transition duration-300 group">
            <div className="p-3 bg-cyan-900/30 rounded-xl group-hover:bg-cyan-500/20 transition">
               <Database className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition" />
            </div>
            <h3 className="text-xl font-bold text-white">Large Data Capacity</h3>
            <p className="text-gray-400 leading-relaxed">
              Process and store vast amounts of educational data securely, enabling comprehensive long-term analysis.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#150a2e]/80 border border-white/5 p-8 rounded-3xl flex flex-col items-start space-y-4 backdrop-blur-sm hover:bg-[#1a103c] hover:border-cyan-500/30 transition duration-300 group">
            <div className="p-3 bg-cyan-900/30 rounded-xl group-hover:bg-cyan-500/20 transition">
               <Shield className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition" />
            </div>
            <h3 className="text-xl font-bold text-white">Secure & Safe</h3>
            <p className="text-gray-400 leading-relaxed">
              Built with enterprise-grade security protocols to ensure student privacy and data integrity at all times.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default FeaturesScreen;