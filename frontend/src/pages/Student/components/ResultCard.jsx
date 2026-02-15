const ResultCard = ({ title, icon, children }) => {
  return (
    <div className="bg-[#150a2e] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute right-0 top-0 w-40 h-40 bg-purple-500/10 blur-[90px] rounded-full"></div>

      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        {icon}
        {title}
      </h3>

      <div className="mt-3">
        {children}
      </div>
    </div>
  );
};

export default ResultCard;
