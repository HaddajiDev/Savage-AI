const express = require("express");
const router = express.Router();
const { OpenAI } = require('openai');
const ChatHistory = require('../models/history');

const openai = new OpenAI({
  baseURL: process.env.BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY
});

router.post('/chat', async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const { PROMPT } = req.body;

    const userMessage = req.body.message;

    
    let chatHistory = await ChatHistory.findOne({ sessionId }) || 
      new ChatHistory({ sessionId, messages: [] });

    const messages = [
      { role: "system", content: PROMPT },
      ...chatHistory.messages,
      { role: "user", content: userMessage }
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL,
      messages: messages
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Update chat history (without saving the system prompt)
    chatHistory.messages.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: aiResponse }
    );
    
    await chatHistory.save();
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.json({ response: "Sorry, AI failed to generate response" });
  }
});

module.exports = router;