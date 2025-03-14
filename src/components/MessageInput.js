import React from "react";

const MessageInput = ({ input, setInput, sendMessage, isLoading }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading && input.trim()) {
      e.preventDefault(); // Evita quebras de linha indesejadas no input
      sendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 p-3 sm:p-4 bg-gray-800 border-t border-gray-700">
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
          className={`px-3 py-2 text-amber-200 font-medium text-sm sm:text-base rounded-lg transition-all ${
            isLoading || !input.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-gray-500"
          }`}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
