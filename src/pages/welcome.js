import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/cjs/styles/prism";

// Componente customizado para renderização de blocos de código
const MarkdownRender = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <SyntaxHighlighter style={coy} language={match[1]} PreTag="div" {...props}>
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export default function Home() {
  // Estados do chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estados para gerenciamento de sessões (histórico)
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const chatContainerRef = useRef(null);

  // Carrega sessões salvas no localStorage ao montar o componente
  useEffect(() => {
    const storedSessions = localStorage.getItem("chatSessions");
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
    // Se houver uma sessão corrente salva, carrega ela
    const lastSession = localStorage.getItem("currentSession");
    if (lastSession) {
      const session = JSON.parse(lastSession);
      setCurrentSessionId(session.id);
      setMessages(session.messages);
    }
  }, []);

  // Salva as sessões no localStorage sempre que elas mudarem
  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  }, [sessions]);

  // Atualiza a sessão corrente sempre que as mensagens ou o id da sessão mudarem
  useEffect(() => {
    if (currentSessionId) {
      const currentSession = { id: currentSessionId, messages, updatedAt: new Date() };
      localStorage.setItem("currentSession", JSON.stringify(currentSession));
      // Atualiza ou adiciona a sessão no histórico
      setSessions((prevSessions) => {
        const otherSessions = prevSessions.filter((s) => s.id !== currentSessionId);
        return [currentSession, ...otherSessions];
      });
    }
  }, [messages, currentSessionId]);

  // Inicia uma nova conversa (nova sessão)
  const startNewConversation = () => {
    setCurrentSessionId(new Date().getTime().toString());
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Adiciona a mensagem do usuário
    const userMessage = { content: input, role: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Formata as mensagens para enviar à API
      const formattedMessages = updatedMessages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      // Mensagem de sistema para orientar o comportamento do assistente
      const messagesWithSystem = [
        { role: "system", content: "Você é um assistente útil e amigável." },
        ...formattedMessages,
      ];

      const response = await getOpenAIResponse(messagesWithSystem);

      // Adiciona a resposta do assistente ao histórico
      setMessages([...updatedMessages, { content: response, role: "assistant" }]);
    } catch (error) {
      console.error("Erro ao obter resposta:", error);
      setMessages([
        ...updatedMessages,
        {
          content: "Desculpe, ocorreu um erro ao processar sua mensagem.",
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

  // Rola para o final do chat sempre que uma nova mensagem é adicionada
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Carrega uma sessão do histórico
  const loadSession = (session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar para histórico de conversas */}
      {showHistory && (
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-3">
          <h2 className="text-lg font-bold mb-4">Histórico de Conversas</h2>
          <button
            onClick={startNewConversation}
            className="w-full mb-4 px-3 py-2 bg-amber-500 text-black rounded-lg"
          >
            Nova Conversa
          </button>
          <ul className="space-y-2">
            {sessions.length === 0 && (
              <li className="text-gray-400">Nenhuma conversa salva.</li>
            )}
            {sessions.map((session) => (
              <li
                key={session.id}
                className="cursor-pointer hover:bg-gray-700 p-2 rounded"
                onClick={() => loadSession(session)}
              >
                <p className="text-sm font-medium">
                  Sessão: {new Date(parseInt(session.id)).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowHistory(false)}
            className="mt-4 px-3 py-2 bg-gray-600 rounded-lg w-full"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Área principal do chat */}
      <div className="flex flex-col w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold text-center text-amber-200">
            BuddyBot
          </h1>
          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-2 bg-amber-500 text-black rounded-lg"
          >
            Histórico
          </button>
        </div>

        {/* Área de mensagens com scroll */}
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
              <p className="text-center">
                Envie uma mensagem para começar...
              </p>
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{ code: MarkdownRender }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ))
          )}

          {isLoading && (
            <div className="bg-gray-700 text-amber-500 p-2 sm:p-3 rounded-lg text-sm sm:text-base mr-auto max-w-[85%] flex items-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Área de input */}
        <div className="p-3 sm:p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm sm:text-base rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-gray-600"
              placeholder="Digite a sua mensagem..."
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