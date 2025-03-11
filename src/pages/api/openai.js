import axios from "axios";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { input } = req.body;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: input }],
            },
          ],
        }
      );

      const output =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "Desculpa, não consegui entender.";

      res.status(200).json({ output });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
