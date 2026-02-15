import React from 'react'

function CaptureButton({children, onclick}) {
  return (
    <div>
      <button onClick= {onclick}
          id="open-camera-btn"
          className="group relative flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1 border border-purple-400/30"
        >
            {children}
        </button>
    </div>
  )
}

export default CaptureButton
