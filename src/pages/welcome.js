import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import ChatHistory from "@/components/ChatHistory";
import MessageInput from "@/components/MessageInput";
import MessageList from "@/components/MessageList";

export default function Home() {
  const router = useRouter();

  // Estados do chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const chatContainerRef = useRef(null);

  // Carrega sessões salvas no localStorage ao montar o componente
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem("chatSessions");
      if (storedSessions) setSessions(JSON.parse(storedSessions));

      const lastSession = localStorage.getItem("currentSession");
      if (lastSession) {
        const session = JSON.parse(lastSession);
        setCurrentSessionId(session.id);
        setMessages(session.messages || []);
      } else {
        startNewConversation();
      }
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
      startNewConversation();
    }
  }, []);

  // Guarda as sessões no localStorage sempre que as mensagens mudarem
  useEffect(() => {
    if (currentSessionId) {
      const currentSession = { id: currentSessionId, messages, updatedAt: new Date().toISOString() };
      localStorage.setItem("currentSession", JSON.stringify(currentSession));

      setSessions((prevSessions) => {
        const otherSessions = prevSessions.filter((s) => s.id !== currentSessionId);
        return [currentSession, ...otherSessions];
      });
    }
  }, [messages, currentSessionId]);

  // Criar uma nova conversa
  const startNewConversation = () => {
    const newSessionId = new Date().getTime().toString();
    setCurrentSessionId(newSessionId);
    setMessages([]);

    const newSession = { id: newSessionId, messages: [], updatedAt: new Date().toISOString() };
    setSessions((prev) => [newSession, ...prev]);
    localStorage.setItem("currentSession", JSON.stringify(newSession));
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!currentSessionId) startNewConversation();

    const userMessage = { content: input, role: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getOpenAIResponse(updatedMessages);
      setMessages([...updatedMessages, { content: response, role: "assistant" }]);
    } catch (error) {
      console.error("Erro ao obter resposta:", error);
      setMessages([...updatedMessages, { content: "Erro ao processar a mensagem.", role: "assistant" }]);
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

    if (!response.ok) throw new Error("Erro ao obter resposta");
    const data = await response.json();
    return data.output;
  };

  // Carregar uma sessão do histórico
  const loadSession = (session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
    setShowHistory(false);
  };

  // Eliminar uma sessão do histórico
  const deleteSession = (sessionId, e) => {
    e.stopPropagation();
    setSessions((prevSessions) => prevSessions.filter((s) => s.id !== sessionId));
    if (sessionId === currentSessionId) startNewConversation();
  };

  // Logout → Redirecionar para a página de autenticação
  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Componente de histórico de conversas */}
      <ChatHistory 
        sessions={sessions}
        loadSession={loadSession}
        deleteSession={deleteSession}
        startNewConversation={startNewConversation}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />

      {/* Área principal do chat */}
      <div className="flex flex-col w-full max-w-3xl mx-auto h-screen">
        {/* Cabeçalho */}
        <div className="sticky top-0 z-10 p-3 sm:p-4 bg-gray-800 border-b border-gray-700 flex items-center">
          {/* Botão Histórico (Esquerda) */}
          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-2 bg-amber-500 text-black rounded-lg"
          >
            Histórico
          </button>

          {/* Nome BuddyBot (Centro) */}
          <h1 className="flex-1 text-lg sm:text-xl font-bold text-center text-amber-200">
            BuddyBot
          </h1>

          {/* Botão Logout (Direita) */}
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-500 text-white rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Lista de mensagens */}
        <MessageList messages={messages} chatContainerRef={chatContainerRef} isLoading={isLoading} />

        {/* Componente de input */}
        <MessageInput input={input} setInput={setInput} sendMessage={sendMessage} isLoading={isLoading} />

        {/* Estilo para scrollbar */}
        <style jsx global>{`
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
      </div>
    </div>
  );
}