const ShimmerLoader = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      {/* Defined the keyframes and classes locally for this single-file demo. 
          In a real project, put these in your global CSS or Tailwind config. */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .shimmer {
          position: relative;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.1); /* Base color */
        }
        .shimmer::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.2) 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 1.5s infinite;
          content: '';
        }
      `}</style>

      {/* Shimmer Layout Structure - mimics the content */}
      <div className="flex flex-col space-y-8">
        
        {/* Header/Title Shimmer */}
        <div className="flex flex-col space-y-4 items-center mb-8">
          <div className="shimmer h-12 w-3/4 md:w-1/2 rounded-lg"></div>
          <div className="shimmer h-4 w-1/2 md:w-1/3 rounded"></div>
        </div>

        {/* Content Blocks / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-6 rounded-xl border border-white/10 space-y-4">
              <div className="shimmer h-48 w-full rounded-lg mb-4"></div>
              <div className="shimmer h-6 w-3/4 rounded"></div>
              <div className="space-y-2">
                <div className="shimmer h-3 w-full rounded"></div>
                <div className="shimmer h-3 w-5/6 rounded"></div>
                <div className="shimmer h-3 w-4/6 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShimmerLoader;