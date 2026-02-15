import React from 'react'

function UploadButton({children, onFileChange}) {
    return (
        <label className="group relative flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer transition-all duration-300 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-1 border border-purple-500/40">
            <input
                type="file"
                id="photo-upload"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onFileChange}
            />
            {children}
        </label>
    )
}

export default UploadButton
