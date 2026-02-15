import React from 'react'

function ClearBtn({ children, onclick }) {
    return (
        <button
            onClick={onclick}
            className="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition"
        >
            {children}
        </button>
    )
}

export default ClearBtn;
