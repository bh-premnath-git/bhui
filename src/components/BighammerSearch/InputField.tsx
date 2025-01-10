import React, { useState, useEffect, useRef } from 'react';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

export default function InputField({ question, setQuestion, handleSearch }) {
  const [height, setHeight] = useState('auto');
  const textareaRef = useRef(null);

  useEffect(() => {
    setHeight(`${textareaRef.current.scrollHeight}px`);
  }, [question]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    setHeight('auto');
    setQuestion(e.target.value);
  };

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
          <textarea
            ref={textareaRef}
            className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 placeholder-gray-500 rounded-lg resize-none border-none focus:outline-none"
            placeholder="Ask Bighammer AI"
            onKeyPress={handleKeyPress}
            onChange={handleInputChange}
            value={question}
            style={{ height, maxHeight: '200px' }}
          />
          <button
            className="p-3 text-indigo-500 hover:bg-gray-200 rounded-lg self-end"
            aria-label="Send message"
            onClick={handleSearch}
          >
            <SendRoundedIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
