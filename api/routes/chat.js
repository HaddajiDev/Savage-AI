const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const { OpenAI } = require('openai');
const ChatHistory = require('../models/history');
const { v4: uuidv4 } = require('uuid');

const openai = new OpenAI({
  baseURL: process.env.BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY
});

function getModeContext(history, currentMode) {
  let context = [];
  let lastMode = null;

  if (history.length === 0) {
    context.push({
      role: "system",
      content: `[System: Conversation mode initialized to ${currentMode === 1 ? "SAVAGE" : "FRIENDLY"}]`
    });
  }

  history.forEach((message) => {
    if (message.role === "system" && message.content.includes("mode changed")) {
      lastMode = message.content.match(/mode changed to (\w+)/i)[1];
    }
    context.push(message);
  });

  const currentModeName = currentMode === 1 ? "SAVAGE" : "FRIENDLY";
  if (!lastMode || lastMode !== currentModeName) {
    context.push({
      role: "system",
      content: `[System: Conversation mode changed to ${currentModeName}]`
    });
  }

  return context;
}

router.post('/chat', async (req, res) => {
  try {
    const { message, mode, username, id, _sessionID } = req.body;
    const sessionId =  _sessionID || req.sessionID;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    let chatHistory = await ChatHistory.findOne({ sessionId }) || 
      new ChatHistory({ sessionId, messages: [], userId: id });

    const SYSTEM_PROMPT = mode === 1 
      ? process.env.SAVAGE_PROMPT 
      : process.env.GOOD_PROMPT;

    const modeContext = getModeContext(chatHistory.messages, mode);
    
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...modeContext,
      { role: "user", content: username !== 'undefined' ? `${message} username=${username}` : message }
    ];

    if (messages.length > 20) {
      messages.splice(0, messages.length - 20);
    }

    const completion = await openai.chat.completions.create({
      model: process.env.MODEL,
      messages
    });
    const aiResponse = completion.choices[0].message.content;

    const updatedMessages = [
      ...modeContext,
      { role: "user", content: message },
      { role: "assistant", content: aiResponse }
    ];

    const trimmedMessages = updatedMessages.slice(-18);

    await ChatHistory.findOneAndUpdate(
      { sessionId },
      { messages: trimmedMessages, userId: id },
      { upsert: true, new: true }
    );

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ response: "AI service unavailable" });
  }
});


router.post('/new-session', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const newChat = new ChatHistory({
      sessionId: uuidv4(),
      userId,
      messages: [],
      createdAt: new Date()
    });

    await newChat.save();
    
    res.status(201).json({
      sessionId: newChat.sessionId,
      createdAt: newChat.createdAt
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create new session' });
  }
});

router.get('/chat', async (req, res) => {
  const { id } = req.query;
  try {    
    const chats = await ChatHistory.find({ userId: new mongoose.Types.ObjectId(id) });
    res.status(200).send({ chats });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
});

router.get('/chat/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const chat = await ChatHistory.findOne({ sessionId });
    if (!chat) return res.status(404).send({ error: 'Chat not found' });
    res.status(200).send({ messages: chat.messages, sessionID: chat.sessionId });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

router.delete('/empty', async (req, res) => {
  try {
    const result = await ChatHistory.deleteMany({
      messages: { $size: 0 }
    });

    res.status(200).json({ message: 'Deleted empty chat histories', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting empty chat histories:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


module.exports = router;