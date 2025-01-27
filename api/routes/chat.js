const express = require("express");
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
    baseURL: process.env.BASE_URL,
    apiKey: process.env.OPENROUTER_API_KEY
  });

router.post('/chat', async (req, res) => {
    try {
      if (!req.session.history) {
        req.session.history = [
          {"role": "system", "content": process.env.PORMPT},
        ];
      }
      
      const userMessage = req.body.message;
      req.session.history.push({ role: "user", content: userMessage });
  
      const completion = await openai.chat.completions.create({
        model: process.env.MODEL,
        messages: req.session.history
      });
  
      const aiResponse = completion.choices[0].message.content;
      req.session.history.push({ role: "assistant", content: aiResponse });
  
      res.json({ response: aiResponse });
    } catch (error) {
      const aiResponse = "sorry.. ai failed to generate response";
      req.session.history.push({ role: "assistant", content: aiResponse });
      res.json({ response: aiResponse });
    }
  });


module.exports = router;