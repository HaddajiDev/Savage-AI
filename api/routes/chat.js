const express = require("express");
const router = express.Router();
const { OpenAI } = require('openai');
const ChatHistory = require('../models/history');

const openai = new OpenAI({
  baseURL: process.env.BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY
});

router.post('/chat', async (req, res) => {
  let chatHistory;
  try {
    const sessionId = req.sessionID;

    chatHistory = await ChatHistory.findOne({ sessionId });
    
    if (!chatHistory) {
      chatHistory = new ChatHistory({
        sessionId,
        messages: [{ role: "system", content: process.env.PORMPT }]
      });
      await chatHistory.save();
    }

    const userMessage = req.body.message;
    chatHistory.messages.push({ role: "user", content: userMessage });
    await chatHistory.save();

    const completion = await openai.chat.completions.create({
      model: process.env.MODEL,
      messages: chatHistory.messages
    });

    const aiResponse = completion.choices[0].message.content;
    chatHistory.messages.push({ role: "assistant", content: aiResponse });
    await chatHistory.save();

    res.json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    const aiResponse = "sorry.. ai failed to generate response";
    
    if (chatHistory) {
      chatHistory.messages.push({ role: "assistant", content: aiResponse });
      await chatHistory.save().catch(e => console.error("Failed to save error:", e));
    }
    
    res.json({ response: aiResponse });
  }
});

module.exports = router;