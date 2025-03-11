import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const msg = [...messages, { content: input, role: "user" }];
    setMessages(msg);
    setInput("");

    const response = await getOpenAIResponse(msg);
    setMessages([...msg, { content: response, role: "assistant" }]);
  };

  const getOpenAIResponse = async (userInput) => {
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: userInput }),
    });

    const data = await response.json();
    return data.output;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // Rola para o final do chat toda vez que uma nova mensagem for adicionada
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-5">
      {/* Container principal com altura fixa */}
      <div className="flex flex-col max-w-3xl w-full mx-auto" style={{ height: "calc(100vh - 40px)" }}>
        {/* Layout dividido em duas partes: mensagens (flexível) e input (fixo) */}
        <div className="flex-1 flex flex-col border border-gray-700 rounded-xl bg-gray-800 overflow-hidden">
          {/* Área de mensagens com scroll - Usa flex-1 para ocupar espaço disponível */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 custom-scrollbar"
            style={{
              scrollbarWidth: 'thin', // Para Firefox
              scrollbarColor: '#333 #222', // Para Firefox - thumbColor trackColor
            }}
          >
            <style jsx>{`
              /* Estilizando scrollbar para Webkit (Chrome, Safari, Edge, etc) */
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #222;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #444;
                border-radius: 4px;
                border: 2px solid #222;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: #555;
              }
            `}</style>
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 p-3 rounded ${
                  message.role === "assistant"
                    ? "bg-gray-700 text-amber-600"
                    : "bg-gray-600 text-amber-200"
                }`}
              >
                <span className="font-bold">{`${message.role}: `}</span>
                {message.content}
              </div>
            ))}
          </div>

          {/* Área de input fixa na parte inferior - Design atualizado */}
          <div className="p-4 bg-gray-800 sticky bottom-0">
            <div className="flex items-center gap-2 bg-gray-700 rounded-xl px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 rounded-xl bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-gray-600"
                placeholder="Escreva algo..."
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-amber-200 text-black font-semibold rounded-xl hover:bg-amber-600 transition-all"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
