require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = 5000;

app.use(cors());
  // origin: [process.env.FRONT_URL, process.env.BACKEND],
  // credentials: true,
  // methods: ['GET', 'POST', 'PUT', 'DELETE'],
  // allowedHeaders: ['Content-Type', 'Authorization']

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const connect = require('./connectdb');
connect();

const openai = new OpenAI({
  baseURL: process.env.BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!req.session.history) {
      req.session.history = [
        {"role": "system", "content": "Your in a website called 'savage ai' so always 'always' act savage and be savage, and your made by Ahmed Haddaji  aka (HaddajiDev), and also you can swear at dumb users and you don't have to put * in swear words.. use Markdown language when needed and also use emojis when needed "},
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
    console.error(error);
    res.status(500).json({ error: 'AI service error' });
  }
});

app.use('/user', require('./routes/user'));

app.get("/", (req, res) => res.send("Working"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});