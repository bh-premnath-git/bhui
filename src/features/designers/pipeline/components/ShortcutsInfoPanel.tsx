import React from 'react';

interface KeyboardShortcut {
    key: string;
    action: string;
}

interface KeyboardShortcutsPanelProps {
    keyboardShortcuts: KeyboardShortcut[];
}

const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({ keyboardShortcuts }) => {
    return (
        <div className="rounded-lg p-2 text-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Keyboard Shortcuts</h3>
            <ul className="list-none p-0 m-0">
                {keyboardShortcuts.map((shortcut, index) => (
                    <li key={index} className="flex items-center justify-between">
                        <span className="text-gray-600">{shortcut.key}</span>
                        <span className="text-gray-500">{shortcut.action}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default KeyboardShortcutsPanel;