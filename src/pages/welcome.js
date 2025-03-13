import { useState, useEffect, useRef } from "react";
import ChatHistory from "./components/ChatHistory";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Lógica de carregar sessões do localStorage...
  }, []);

  const sendMessage = async () => {
    // Lógica de envio de mensagens...
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <ChatHistory 
        sessions={sessions} 
        loadSession={/* função de carregar sessão */} 
        deleteSession={/* função de apagar sessão */} 
        startNewConversation={/* função de nova sessão */} 
        showHistory={showHistory} 
        setShowHistory={setShowHistory} 
      />
      <div className="flex flex-col w-full max-w-3xl mx-auto h-screen">
        <MessageList messages={messages} chatContainerRef={chatContainerRef} isLoading={isLoading} />
        <MessageInput input={input} setInput={setInput} handleKeyDown={/* função de tecla pressionada */} sendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
