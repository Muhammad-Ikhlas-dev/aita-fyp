import React, { useState } from 'react';

function NamePromptModal({ onSubmit, onCancel, isOpen }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Please enter a name');
            return;
        }

        onSubmit(name.trim());
        setName('');
        setError('');
    };

    const handleCancel = () => {
        setName('');
        setError('');
        onCancel();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
                {/* Header */}
                <h2 className="text-2xl font-bold text-white mb-2">
                    Enter Name
                </h2>
                <p className="text-slate-400 mb-6">
                    Please provide a name for this image
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter name (e.g., John Doe)"
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                                <span>⚠️</span>
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 px-6 py-3 rounded-lg font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-200"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NamePromptModal;
