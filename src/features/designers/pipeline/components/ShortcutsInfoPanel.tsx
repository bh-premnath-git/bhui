import React, { useState } from 'react';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcut {
    key: string;
    action: string;
}

interface KeyboardShortcutsPanelProps {
    keyboardShortcuts: KeyboardShortcut[];
}

const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({ keyboardShortcuts }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="fixed bottom-5 left-25">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-200"
                title="Keyboard Shortcuts"
            >
                <Keyboard className={`w-5 h-5 text-gray-600 ${isExpanded ? 'text-blue-500' : ''}`} />
            </button>

            {isExpanded && (
                <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[250px] animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Keyboard Shortcuts</h3>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-2">
                        {keyboardShortcuts.map((shortcut, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between text-sm py-1"
                            >
                                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-mono text-xs">
                                    {shortcut.key}
                                </kbd>
                                <span className="text-gray-500">{shortcut.action}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KeyboardShortcutsPanel;