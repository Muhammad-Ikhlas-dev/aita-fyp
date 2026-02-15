const ScoreBar = ({ item }) => {
  const percentage = (item.score / item.total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-semibold text-white">{item.title}</span>
        <span className={`text-sm font-bold 
          ${item.status === "fail" ? "text-red-400" : "text-green-400"}
        `}>
          {item.score}/{item.total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 
            ${item.status === 'fail' ? 'bg-red-500' : 'bg-cyan-500'}
          `}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ScoreBar;
