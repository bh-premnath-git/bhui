import React, { useState } from 'react';
import { FaUser, FaHammer } from 'react-icons/fa';
import './BigHammerSearch.css';

function BigHammerSearch() {
    const [question, setQuestion] = useState('');
    const [conversation, setConversation] = useState([]);

    const handleSearch = async () => {
        try {
            const res = await fetch('http://localhost:9090/sql_agent', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question,
                    thread_id: "thread_123456"
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            setConversation([...conversation, { question, response: data.answer }]);
            setQuestion('');
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="bighammer-container">
            <div className="bighammer-chat">
                <div className="bighammer-conversation">
                    {conversation.map((entry, index) => (
                        <div key={index} className="bighammer-entry">
                            <div className="bighammer-user">
                                <FaUser className="avatar" />
                                <p>{entry.question}</p>
                            </div>
                            <div className="bighammer-response">
                                <FaHammer className="avatar" />
                                <p>{entry.response}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bighammer-input-container">
                    <textarea
                        className="bighammer-input"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question here..."
                    />
                    <button className="bighammer-button" onClick={handleSearch}>Search</button>
                </div>
            </div>
        </div>
    );
}

export default BigHammerSearch; 