import { useState } from 'react';
import { Check } from 'lucide-react';
import glowImg from '../assets/glow.png'; 

function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className="min-h-screen bg-navy font-sans text-white selection:bg-glow selection:text-white overflow-x-hidden relative">
      
      {/* --- GLOBAL BACKGROUND GLOW --- */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
        <img 
          src={glowImg} 
          alt="" 
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[200%] lg:w-[120%] max-w-none opacity-40 mix-blend-screen blur-3xl"
        />
      </div>

      {/* Content Wrapper (z-10 ensures it sits above the background glow) */}
      <div className="sm:mt-20 relative z-10">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center lg:text-left lg:flex-row lg:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-medium mb-6">Plans & Pricing</h1>
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl">
                Whether your time-saving automation needs are large or small, we're here to help you scale.
              </p>
            </div>

            <div className="bg-white/10 p-1 rounded-full flex items-center w-fit self-center lg:self-end">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-purple-500 to-glow text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                MONTHLY
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-purple-500 to-glow text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                YEARLY
              </button>
            </div>
          </div>

          {/* Pricing Layout Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 relative">
            
            {/* Shared Backdrop for Starter & Professional */}
            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[66%] bg-gradient-to-b from-purple/20 to-navy/40 rounded-l-3xl border border-white/5 backdrop-blur-sm -z-10" />
            <div className="lg:hidden absolute top-0 left-0 w-full h-[66%] bg-gradient-to-b from-purple/10 to-navy/20 rounded-3xl border border-white/5 backdrop-blur-sm -z-10" />

            {/* Starter Plan */}
            <div className="lg:col-span-4 p-8 lg:p-10 flex flex-col items-center text-center lg:items-start lg:text-left h-full border-r border-white/5 lg:border-r-0 relative overflow-hidden">
              <div className="mb-2 z-10">
                <span className="text-4xl font-bold text-purple-200">
                  ${billingCycle === 'monthly' ? '19' : '190'}
                </span>
                <span className="text-gray-400 ml-2">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              <h3 className="text-2xl font-medium mt-4 mb-2 z-10">Starter</h3>
              <p className="text-gray-400 text-sm mb-8 h-12 z-10">
                Unleash the power of automation.
              </p>

              <ul className="space-y-4 mb-8 flex-1 w-full z-10">
                {['coming soon', 'coming soon', 'coming soon'].map((item, i) => (
                  <li key={i} className="flex items-center justify-center lg:justify-start text-gray-300 text-sm">
                    <div className="bg-purple/50 p-0.5 rounded-full mr-3 text-glow">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <button className="w-full py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium z-10">
                Choose
              </button>
            </div>

            {/* Professional Plan */}
            <div className="lg:col-span-4 p-8 lg:p-10 flex flex-col items-center text-center lg:items-start lg:text-left h-full relative overflow-hidden">
              <div className="hidden lg:block absolute left-0 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent z-10"></div>
              
              <div className="mb-2 z-10">
                <span className="text-4xl font-bold text-purple-200">
                  ${billingCycle === 'monthly' ? '54' : '540'}
                </span>
                <span className="text-gray-400 ml-2">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              <h3 className="text-2xl font-medium mt-4 mb-2 z-10">Professional</h3>
              <p className="text-gray-400 text-sm mb-8 h-12 z-10">
                Advanced tools to take your work to the next level.
              </p>

              <ul className="space-y-4 mb-8 flex-1 w-full z-10">
                {['coming soon', 'coming soon', 'coming soon', 'coming soon'].map((item, i) => (
                  <li key={i} className="flex items-center justify-center lg:justify-start text-gray-300 text-sm">
                    <div className="bg-purple/50 p-0.5 rounded-full mr-3 text-glow">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <button className="w-full py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium z-10">
                Choose
              </button>
            </div>

            {/* Company Plan (Highlighted Card) */}
            <div className="lg:col-span-4 relative">
              <div className="bg-[#0B0F3A] rounded-3xl p-8 lg:p-10 flex flex-col items-center text-center lg:items-start lg:text-left h-full border border-white/10 shadow-2xl relative overflow-hidden lg:-ml-4 lg:scale-105 z-10">
                
                {/* CSS Gradient Orb (kept for card definition) */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple/60 blur-[80px] rounded-full pointer-events-none"></div>

                {/* Most Popular Badge */}
                <div className="self-center lg:self-end mb-4 z-10">
                  <span className="px-4 py-1.5 rounded-full bg-white/10 text-[10px] font-bold tracking-wider uppercase text-purple-200">
                    Most Popular
                  </span>
                </div>

                <div className="mb-2 z-10">
                  <span className="text-5xl font-bold text-white">
                    ${billingCycle === 'monthly' ? '89' : '890'}
                  </span>
                  <span className="text-gray-400 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-medium mt-4 mb-2 z-10">Company</h3>
                <p className="text-gray-400 text-sm mb-8 z-10">
                  Automation plus enterprise-grade features.
                </p>

                <ul className="space-y-4 mb-10 flex-1 z-10 w-full relative">
                  {['coming soon', 'coming soon', 'coming soon', 'coming soon', 'coming soon'].map((item, i) => (
                    <li key={i} className="flex items-center justify-center lg:justify-start text-gray-300 text-sm">
                      <div className="bg-white/10 p-0.5 rounded-full mr-3 text-white">
                          <Check size={12} strokeWidth={3} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <button className="w-full py-4 rounded-full bg-gradient-to-r from-[#b25aff] to-[#d65aff] hover:opacity-90 transition-opacity text-white text-sm font-medium shadow-lg shadow-purple-900/40 z-10">
                  Choose plan
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Pricing;