import React, { useState } from "react";
import axios from "axios";
import "./ChatBot.css";

const ChatBot = () => {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { sender: "user", text: message };
        setChatHistory(prev => [...prev, userMessage]);

        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/facebook/blenderbot-3B",
                { inputs: message },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_HUGGINGFACE_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            

            console.log("Réponse API:", response.data);  // Debug pour voir la structure exacte de la réponse

            const botMessage = {
                sender: "bot",
                text: response.data.generated_text || response.data[0]?.generated_text || "Désolé, je n'ai pas compris votre question."
            };

            setChatHistory(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Erreur avec l'API Hugging Face:", error.response ? error.response.data : error.message);
            setChatHistory(prev => [...prev, { sender: "bot", text: "Erreur avec le serveur Hugging Face." }]);
        }

        setMessage("");
    };

    return (
        <div className="chatbot-container">
            <h3>Assistant IA 🤖</h3>
            <div className="chat-history">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Posez votre question..."
                className="chat-input"
            />
            <button onClick={handleSendMessage} className="chat-send-btn">Envoyer</button>
        </div>
    );
};

export default ChatBot;
