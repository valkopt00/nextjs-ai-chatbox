import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownRender from "./MarkdownRender";

const MessageList = ({ messages, chatContainerRef, isLoading }) => {
  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar" style={{ height: "calc(100vh - 132px)" }}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p className="text-center">Envie uma mensagem para começar...</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <div key={index} className={`mb-2 p-2 sm:p-3 rounded-lg text-sm sm:text-base ${
            message.role === "assistant" ? "bg-gray-700 text-amber-500 mr-auto" : "bg-gray-600 text-amber-200 ml-auto"
          } max-w-[85%]`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: MarkdownRender }}>
              {message.content}
            </ReactMarkdown>
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
  );
};

export default MessageList;
