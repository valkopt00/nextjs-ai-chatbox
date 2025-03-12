import axios from "axios";

// Use OPENAI_API_KEY sem o prefixo NEXT_PUBLIC_
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { input } = req.body;

    // Verificação básica de array
    if (!Array.isArray(input)) {
      return res.status(400).json({ error: "Input deve ser um array de mensagens" });
    }

    try {
      // Adicionar instrução para usar português de Portugal
      const systemMessage = {
        role: "system",
        content: "O teu nome é BuddyBot. Responda sempre em português de Portugal, usando expressões, vocabulário e construções gramaticais típicas de Portugal."
      };

      // Verificar se já existe uma mensagem de sistema
      const hasSystemMessage = input.some(msg => msg.role === "system");
      
      // Preparar mensagens finais
      const finalMessages = hasSystemMessage 
        ? input.map(msg => msg.role === "system" 
            ? { ...msg, content: msg.content + " " + systemMessage.content }
            : msg)
        : [systemMessage, ...input];

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: finalMessages,
          max_tokens: 1500, // Aumentado para permitir respostas mais completas
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const output = response.data.choices[0]?.message?.content?.trim() || "Desculpe, não entendi.";
      
      res.status(200).json({ output });
    } catch (error) {
      console.error("Erro:", error.message);
      
      // Mensagem de erro simplificada
      const errorMessage = error.response?.data?.error?.message || "Erro no servidor";
      res.status(500).json({ error: errorMessage });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
