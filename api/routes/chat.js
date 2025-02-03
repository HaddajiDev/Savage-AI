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
    const { message, mode, username } = req.body;
    const sessionId = req.sessionID;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    
    const SYSTEM_PROMPT = 
      mode === 1 ? process.env.SAVAGE_PROMPT : process.env.GOOD_PROMPT;

    let chatHistory = await ChatHistory.findOne({ sessionId }) || 
      new ChatHistory({ sessionId, messages: [] });

    const userMessage = username 
      ? `${message} (username: ${username})`
      : message;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.messages,
      { role: "user", content: userMessage }
    ];

    if (messages.length > 20) {
      messages.splice(1, messages.length - 20);
    }

    const completion = await openai.chat.completions.create({
      model: process.env.MODEL,
      messages
    });

    const aiResponse = completion.choices[0].message.content;

    await ChatHistory.findOneAndUpdate(
      { sessionId },
      { 
        $push: { 
          messages: { 
            $each: [
              { role: "user", content: userMessage },
              { role: "assistant", content: aiResponse }
            ],
            $slice: -20
          } 
        } 
      },
      { upsert: true }
    );

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ response: "AI service unavailable" });
  }
});

module.exports = router;