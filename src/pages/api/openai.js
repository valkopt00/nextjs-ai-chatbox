import axios from "axios";

// Use OPENAI_API_KEY sem o prefixo NEXT_PUBLIC_
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { input } = req.body;

    // Verificar se input é um array válido de mensagens
    if (!Array.isArray(input)) {
      return res.status(400).json({ error: "Input deve ser um array de mensagens" });
    }
    
    // Validar e corrigir o formato das mensagens
    const validRoles = ['system', 'assistant', 'user', 'function', 'tool', 'developer'];
    const validatedMessages = input.map(msg => {
      // Verificar se a mensagem tem a estrutura correta
      if (!msg || typeof msg !== 'object' || !msg.content) {
        return { role: 'user', content: String(msg) };
      }
      
      // Verificar se o role é válido
      if (!msg.role || !validRoles.includes(msg.role)) {
        // Se o role for 'Eu' ou inválido, converter para 'user'
        return { ...msg, role: 'user' };
      }
      
      return msg;
    });

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: validatedMessages,
          max_tokens: 150, // Aumentei um pouco o limite de tokens
          temperature: 0.7, // Adicionei temperatura para controlar a criatividade
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      // Verificar se a resposta contém os dados esperados
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error("Resposta inesperada da API da OpenAI");
      }

      const output = response.data.choices[0]?.message?.content?.trim() || "Desculpe, não entendi.";
      
      // Log para debugging (remova em produção)
      console.log("API Response:", response.data);
      console.log("Mensagens enviadas:", validatedMessages);
      
      res.status(200).json({ output });
    } catch (error) {
      console.error("Erro detalhado:", error.response?.data || error.message);
      
      // Fornecer mensagem de erro mais específica
      const errorMessage = error.response?.data?.error?.message || error.message || "Erro no servidor";
      res.status(500).json({ error: errorMessage });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
