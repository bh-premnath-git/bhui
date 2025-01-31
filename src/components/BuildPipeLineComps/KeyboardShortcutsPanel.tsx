import { useState } from 'react';

const KeyboardShortcutsPanel = ({ keyboardShortcuts }) => {
    const [isMinimized, setIsMinimized] = useState(true);

    const togglePanel = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <div className="fixed bottom-5 left-5 z-50">
            {/* Toggle Button */}
            <button
                onClick={togglePanel}
                className="bg-black rounded-full shadow-lg p-2 hover:bg-black transition-all duration-300 ease-in-out hover:shadow-xl"
            >
                {isMinimized ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                        />
                    </svg>
                )}
            </button>

            {/* Panel Content */}
            <div
                className={` bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
                    isMinimized ? 'max-h-0 opacity-0 mt-0' : 'max-h-64 opacity-100 mt-2'
                }`}
                style={{ transitionProperty: 'max-height, opacity, margin-top' }}
            >
                <div className="p-3">
                    <div className="text-gray-800 font-semibold mb-3 text-md">Keyboard Shortcuts</div>
                    <div className="space-y-2 w-[200px]">
                        {keyboardShortcuts.map(({ key, action }) => (
                            <div
                                key={key}
                                className="flex justify-between items-center  p-2 bg-blue-50 rounded-md hover:bg-blue-100 transition-all duration-200 ease-in-out"
                            >
                                <span className="font-mono bg-blue-200 px-1.5 py-1 rounded text-sm text-blue-800">
                                    {key}
                                </span>
                                <span className="text-sm text-blue-800 font-medium">
                                    {action}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsPanel;