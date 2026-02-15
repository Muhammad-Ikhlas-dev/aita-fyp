import React from "react";
import { ChevronDown } from "lucide-react";

const ClassSelect = ({ classes, selectedClassId, setSelectedClassId }) => {
  return (
    <div className="mb-6">
      <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
        Step 1: Select Class
      </label>

      <div className="relative">
        <select
          className="w-full bg-[#0d0620] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">-- Choose a class --</option>

          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  );
};

export default ClassSelect;
