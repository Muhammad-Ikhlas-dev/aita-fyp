import { ChevronDown } from "lucide-react";

const AssignmentSelect = ({ assignments, selectedClassId }) => {
  return (
    <div
      className={`mb-6 transition-all duration-300 ${
        selectedClassId ? "opacity-100" : "opacity-40 pointer-events-none"
      }`}
    >
      <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
        Step 2: Select Assignment
      </label>

      <div className="relative">
        <select className="w-full bg-[#0d0620] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer">
          <option value="">-- Choose assignment --</option>

          {assignments.map((asm) => (
            <option key={asm.id} value={asm.id}>
              {asm.title} (Due: {asm.due})
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>
    </div>
  );
};

export default AssignmentSelect;
