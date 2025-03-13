import React from "react";

const ChatHistory = ({ sessions, loadSession, deleteSession, startNewConversation, showHistory, setShowHistory }) => {
  return (
    <>
      <div 
        className={`fixed top-0 bottom-0 left-0 z-30 bg-gray-800 border-r border-gray-700 p-3 w-64 transform transition-transform duration-300 ${
          showHistory ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-lg font-bold mb-4">Histórico de Conversas</h2>
        <button onClick={startNewConversation} className="w-full mb-4 px-3 py-2 bg-amber-500 text-black rounded-lg">
          Nova Conversa
        </button>
        <ul className="space-y-2 overflow-y-auto max-h-[calc(100vh-140px)]">
          {sessions.length === 0 ? (
            <li className="text-gray-400">Nenhuma conversa salva.</li>
          ) : (
            sessions.map((session) => (
              <li key={session.id} className="cursor-pointer hover:bg-gray-700 p-2 rounded flex justify-between items-center" onClick={() => loadSession(session)}>
                <p className="text-sm font-medium truncate flex-1">
                  {new Date(session.updatedAt || parseInt(session.id)).toLocaleString()}
                </p>
                <button onClick={(e) => deleteSession(session.id, e)} className="text-gray-400 hover:text-red-500 text-sm ml-2">
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
        <button onClick={() => setShowHistory(false)} className="mt-4 px-3 py-2 bg-gray-600 rounded-lg w-full">
          Fechar
        </button>
      </div>
      {showHistory && <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setShowHistory(false)} />}
    </>
  );
};

export default ChatHistory;