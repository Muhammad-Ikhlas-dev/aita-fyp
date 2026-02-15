import React from 'react'

function UploadedImagePreview({url, index, handleRemoveImage, Key}) {
    const closeBtnStyle = "absolute top-1 bg-white right-1 left-22 bottom-0 w-5 h-5 flex items-center justify-center transition-transform duration-200 ease-out hover:scale-110"
    return (
    <div
    key={Key}
    className="relative w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden border-2 border-purple-500/60 shadow-lg shadow-purple-900/30"
  >
    <button onClick={handleRemoveImage} className={closeBtnStyle}> ❌ </button>
    <img
      src={url}
      alt={`Preview ${index + 1}`}
      className="w-full h-full object-cover"
    />
  </div>
  )
}

export default UploadedImagePreview
