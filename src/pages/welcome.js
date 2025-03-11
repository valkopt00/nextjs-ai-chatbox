import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Adiciona a mensagem do usuário
    const userMessage = { content: input, role: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Envie apenas as mensagens formatadas corretamente para a API
      const formattedMessages = updatedMessages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }));

      // Insira uma mensagem de sistema no início para orientar o comportamento
      const messagesWithSystem = [
        { role: "system", content: "Você é um assistente útil e amigável." },
        ...formattedMessages
      ];

      const response = await getOpenAIResponse(messagesWithSystem);
      
      // Adicione a resposta do assistente ao histórico de mensagens
      setMessages([...updatedMessages, { content: response, role: "assistant" }]);
    } catch (error) {
      console.error("Erro ao obter resposta:", error);
      setMessages([
        ...updatedMessages,
        { content: "Desculpe, ocorreu um erro ao processar sua mensagem.", role: "assistant" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getOpenAIResponse = async (messagesInput) => {
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: messagesInput }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao obter resposta");
    }

    const data = await response.json();
    return data.output;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Container principal com altura adaptativa */}
      <div className="flex flex-col w-full h-screen max-w-3xl mx-auto">
        {/* Header (opcional) */}
        <div className="p-3 sm:p-4 bg-gray-800 border-b border-gray-700">
          <h1 className="text-lg sm:text-xl font-bold text-center text-amber-200">BuddyBot</h1>
        </div>

        {/* Área de mensagens com scroll - Usa flex-1 para ocupar espaço disponível */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar"
        >
          <style jsx>{`
            /* Estilizando scrollbar para Webkit (Chrome, Safari, Edge, etc) */
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
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
          
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p className="text-center">Envie uma mensagem para começar...</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 p-2 sm:p-3 rounded-lg text-sm sm:text-base ${
                  message.role === "assistant"
                    ? "bg-gray-700 text-amber-500 mr-auto"
                    : "bg-gray-600 text-amber-200 ml-auto"
                } max-w-[85%]`}
              >
                {message.content}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="bg-gray-700 text-amber-500 p-2 sm:p-3 rounded-lg text-sm sm:text-base mr-auto max-w-[85%] flex items-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Área de input fixa na parte inferior */}
        <div className="p-3 sm:p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm sm:text-base rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-gray-600"
              placeholder="Digite sua mensagem..."
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`px-3 py-2 text-black font-medium text-sm sm:text-base rounded-lg transition-all ${
                isLoading || !input.trim() 
                  ? "bg-gray-500 cursor-not-allowed" 
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}