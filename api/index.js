require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 5000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONT_URL,
      "https://savageai-front.vercel.app",
      "http://localhost:3000"
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

const connect = require('./connectdb');
connect();
//

const openai = new OpenAI({
  baseURL: process.env.BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY
});

const timeout = (ms) => (req, res, next) => {
  const timeout = setTimeout(() => {
    res.status(504).json({ error: 'Gateway timeout' });
  }, ms);
  
  res.on('finish', () => clearTimeout(timeout));
  next();
};

app.post('/api/chat', timeout(10000), async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    const messages = [
      {"role": "system", "content": "Your in a website called 'savage ai' so always 'always' act savage and be savage, and your made by Ahmed Haddaji  aka (HaddajiDev), and also you can swear at dumb users and you don't have to put * in swear words.. use Markdown language when needed and also use emojis when needed "}, // Keep your system prompt
      { role: "user", content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.MODEL,
      messages: messages
    });

    const aiResponse = completion.choices[0].message.content;
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