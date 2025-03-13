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

  // Estados para gestão de sessões (histórico)
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const chatContainerRef = useRef(null);

  // Carrega sessões salvas no localStorage ao montar o componente
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem("chatSessions");
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }
      
      // Se houver uma sessão corrente salva, carrega-a
      const lastSession = localStorage.getItem("currentSession");
      if (lastSession) {
        const session = JSON.parse(lastSession);
        setCurrentSessionId(session.id);
        setMessages(session.messages || []);
      } else {
        // Se não houver sessão atual, cria uma nova
        startNewConversation();
      }
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
      startNewConversation();
    }
  }, []);

  // Guarda as sessões no localStorage sempre que elas mudarem
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Atualiza a sessão corrente sempre que as mensagens ou o id da sessão mudarem
  useEffect(() => {
    if (currentSessionId) {
      const currentSession = { 
        id: currentSessionId, 
        messages: messages, 
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem("currentSession", JSON.stringify(currentSession));
      
      // Atualiza ou adiciona a sessão no histórico
      setSessions((prevSessions) => {
        const otherSessions = prevSessions.filter((s) => s.id !== currentSessionId);
        return [currentSession, ...otherSessions];
      });
    }
  }, [messages, currentSessionId]);

  // Rola para o final do chat sempre que uma nova mensagem é adicionada
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Inicia uma nova conversa (nova sessão)
  const startNewConversation = () => {
    const newSessionId = new Date().getTime().toString();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    
    const newSession = { 
      id: newSessionId, 
      messages: [], 
      updatedAt: new Date().toISOString() 
    };
    
    setSessions(prev => [newSession, ...prev]);
    localStorage.setItem("currentSession", JSON.stringify(newSession));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Cria sessão se não existir
    if (!currentSessionId) {
      startNewConversation();
    }

    // Adiciona a mensagem do utilizador
    const userMessage = { content: input, role: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const formattedMessages = updatedMessages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const messagesWithSystem = [
        { role: "system", content: "Você é um assistente útil e amigável." },
        ...formattedMessages,
      ];

      const response = await getOpenAIResponse(messagesWithSystem);
      setMessages([...updatedMessages, { content: response, role: "assistant" }]);
    } catch (error) {
      console.error("Erro ao obter resposta:", error);
      setMessages([
        ...updatedMessages,
        {
          content: "Ocorreu um erro ao processar a sua mensagem.",
          role: "assistant",
        },
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

  // Carrega uma sessão do histórico
  const loadSession = (session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
    setShowHistory(false);
  };

  // Remove uma sessão do histórico
  const deleteSession = (sessionId, e) => {
    e.stopPropagation();
    setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
    if (sessionId === currentSessionId) {
      startNewConversation();
    }
  };

  // Função de logout: redireciona para a página de autenticação
  const handleLogout = () => {
    // Opcional: limpar dados do localStorage se necessário
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
        {/* Header fixo */}
        <div className="sticky top-0 z-10 p-3 sm:p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold text-center text-amber-200">
            BuddyBot
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowHistory(true)}
              className="px-3 py-2 bg-amber-500 text-black rounded-lg"
            >
              Histórico
            </button>
            {/* Botão de Logout */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-500 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Lista de mensagens */}
        <MessageList 
          messages={messages}
          chatContainerRef={chatContainerRef}
          isLoading={isLoading}
        />

        {/* Componente de input */}
        <MessageInput 
          input={input}
          setInput={setInput}
          handleKeyDown={handleKeyDown}
          sendMessage={sendMessage}
          isLoading={isLoading}
        />

        {/* Estilo global para scrollbar */}
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