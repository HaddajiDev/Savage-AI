import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useSelector } from 'react-redux';
import '../css/Chat.css';

marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: (code, lang) => code
});

const Loader = () => (
  <div className="loader">
    <div className="loader-dot"></div>
    <div className="loader-dot"></div>
    <div className="loader-dot"></div>
  </div>
);

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visible, setVisiblily] = useState(false);
  const messagesEndRef = useRef(null);
  const [SavageMode, setSavageMode] = useState(false);


  const user = useSelector(state => state.user.user);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedChat) {
      handleNewChat();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const parseMessage = (content) => {
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const [fullMatch, lang, code] = match;
      const startIndex = match.index;
      
      if (startIndex > lastIndex) {
        parts.push({
          type: 'markdown',
          content: content.substring(lastIndex, startIndex)
        });
      }

      parts.push({
        type: 'code',
        language: lang?.trim() || 'text',
        content: code.trim()
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'markdown',
        content: content.substring(lastIndex)
      });
    }

    return parts;
  };

  const renderMarkdown = (text) => {
    const rawHtml = marked.parse(text);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return { __html: cleanHtml };
  };

  const handleCopy = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleRegenerate = async (messageId) => {
    if (isLoading) return;
    
    const targetMessage = messages.find(msg => msg.id === messageId);
    const userMessage = messages[messages.indexOf(targetMessage) - 1];

    if (userMessage) {
      setIsLoading(true);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      try {
        setMessages(prev => [...prev, { 
          id: Date.now(),
          isUser: false, 
          content: '', 
          isThinking: true 
        }]);

        const response = await fetch(`${process.env.REACT_APP_LINK}/api/chat`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage.content,
          username: user?.username,
          mode: SavageMode ? 1 : 0 })
        });

        const data = await response.json();
        const aiMessage = { 
          id: Date.now(),
          content: data.response, 
          isUser: false, 
          parts: parseMessage(data.response) 
        };
        
        setMessages(prev => [
          ...prev.filter(msg => !msg.isThinking), 
          aiMessage
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      id: Date.now(),
      content: input,
      isUser: true,
      parts: parseMessage(input)
    };
    
    setIsLoading(true);
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      setMessages(prev => [...prev, { 
        id: Date.now(),
        isUser: false,
        content: '',
        isThinking: true
      }]);

      const response = await fetch(`${process.env.REACT_APP_LINK}/api/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input,
        username: user?.username,
        mode: SavageMode ? 1 : 0})
      });

      const data = await response.json();
      const aiMessage = { 
        id: Date.now(),
        content: data.response,
        isUser: false,
        parts: parseMessage(data.response)
      };
      
      setMessages(prev => [
        ...prev.filter(msg => !msg.isThinking),
        aiMessage
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev.filter(msg => !msg.isThinking),
        { id: Date.now(), content: 'Error connecting to AI service', isUser: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `Chat ${chats.length + 1}`,
      lastMessage: '',
      timestamp: new Date().toLocaleTimeString()
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat.id);
    setMessages([]);
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-app">
      {visible && (
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Chat History</h2>
          <button onClick={handleNewChat} className="new-chat-btn">
            + New Chat
          </button>
        </div>
        <p className='disclaimer'>chat history do not work yet</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="chat-list">
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat === chat.id ? 'selected' : ''}`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="chat-item-header">
                <h3>{chat.title}</h3>
                <span className="timestamp">{chat.timestamp}</span>
              </div>
              <p className="last-message">
                {chat.lastMessage || 'New chat...'}
              </p>
            </div>
            
          ))}
        </div>
      </div>)}
      <div className="main-chat-area">
      <button className='toggle-sidebar-btn' onClick={() => setVisiblily(!visible)}>{visible ? "<" : ">"}</button>      
        {selectedChat ? (
          <>
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
                  {msg.isThinking ? (
                    <div className="thinking-indicator">
                      <Loader />
                    </div>
                  ) : (
                    <div className="message-content">
                      {msg.parts?.map((part, partIndex) => (
                        part.type === 'code' ? (
                          <div key={partIndex} className="code-block">
                            <div className="code-header">
                              <span className="code-lang">{part.language}</span>
                              <button
                                className="copy-btn"
                                onClick={() => handleCopy(part.content, msg.id)}
                              >
                                {copiedMessageId === msg.id ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              language={part.language}
                              style={vscDarkPlus}
                              className="syntax-highlighter"
                            >
                              {part.content}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <div
                            key={partIndex}
                            className="markdown-content"
                            dangerouslySetInnerHTML={renderMarkdown(part.content)}
                          />
                        )
                      ))}

                      {!msg.isUser && (
                        <div className="message-actions">
                          <button
                            className="action-btn regenerate-btn"
                            onClick={() => handleRegenerate(msg.id)}
                            disabled={isLoading}
                          >
                            ⟳ Regenerate
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
              
            <form className="chat-input" onSubmit={handleSubmit}>
              <div style={{width: '100%', display: 'flex'}}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} style={{marginLeft: '20px'}}>
                  {isLoading ? <Loader /> : <img style={{width: '25px'}} src='https://cdn4.iconfinder.com/data/icons/multimedia-75/512/multimedia-42-256.png'/>}
                </button>
                </div>   
                <div>
                    <div className="skull-button-container">
                    <button 
                      type="button" 
                      className={`skull-button ${SavageMode ? 'active' : ''}`}
                      onClick={() => setSavageMode(!SavageMode)}
                    >
                    Savage Mode 💀
                  </button>
                 </div>
                </div> 
            </form>
            
            
            
          </>
        ) : (
          <div className="empty-state">
            <h3>Select a chat or start a new conversation</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;