import React from "react";
import { UploadCloud, AlertTriangle, FileText } from "lucide-react";

const FileUploader = ({
  uploadedFile,
  setUploadedFile,
  errorMessage,
  setErrorMessage,
  accept = ".docx",
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isDocx =
      file.name.toLowerCase().endsWith(".docx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isDocx) {
      setUploadedFile(null);
      setErrorMessage("Invalid format. Please upload a .docx file.");
      return;
    }

    setUploadedFile(file);
    setErrorMessage("");
  };

  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
        Step 3: Upload File
      </label>

      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition relative ${
          uploadedFile
            ? "border-green-500/50 bg-green-500/5"
            : errorMessage
            ? "border-red-500/50 bg-red-500/5"
            : "border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
        />

        {!uploadedFile ? (
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg transition ${
                errorMessage
                  ? "bg-red-900/20 text-red-400 border border-red-500/30"
                  : "bg-[#0d0620] border border-white/10 text-cyan-400"
              }`}
            >
              {errorMessage ? <AlertTriangle size={28} /> : <UploadCloud size={28} />}
            </div>

            <h4 className="font-semibold text-gray-200">
              Click to upload or drag and drop
            </h4>
            <p className="text-sm text-gray-500 mt-2">DOCX only (Max 10MB)</p>

            {errorMessage && (
              <p className="text-sm text-red-400 mt-3 font-medium animate-pulse">
                {errorMessage}
              </p>
            )}
          </label>
        ) : (
          <div className="flex flex-col items-center animate-fade-in gap-2">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
              <FileText size={32} />
            </div>

            <p className="font-semibold">{uploadedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setUploadedFile(null)}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20"
              >
                Remove
              </button>

              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm cursor-pointer hover:bg-white/10"
              >
                Change
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
