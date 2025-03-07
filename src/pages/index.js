import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    // Add user message to the chat
    const msg = [...messages, { content: input, role: "user" }];
    setMessages(msg);
    setInput("");

    // Call OpenAI API to get the bot's response
    const response = await getOpenAIResponse(msg);
    setMessages([
      ...msg,
      { content: response, role: "assistant" },
    ]);
  };

  const getOpenAIResponse = async (userInput) => {
    // Make API request to OpenAI
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: userInput }),
    });

    const data = await response.json();
    return data.output;
  };

  return (
    <div
      id="chat-container"
      className="overflow-y-auto p-10 rounded-md max-w-3xl mx-auto"
    >
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.role === "assistant" ? "text-blue-600" : "text-green-600"
            }`}
          >
            <span className="font-bold">{`${message.role}: `}</span>
            {message.role === "assistant" && <span>{message.content}</span>}
            {message.role !== "assistant" && message.content}
          </div>
        ))}
      </div>
      <div className="pt-5 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-md text-black bg-transparent focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
}