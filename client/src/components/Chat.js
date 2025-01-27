import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import '../css/Chat.css';
import { useSelector } from 'react-redux';

marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: (code, lang) => code
});

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const user = useSelector(state => state.user.user);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          body: JSON.stringify({ message: userMessage.content + ` username : ${user?.username}` })
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
        body: JSON.stringify({ message: input + ` username : ${user?.username}`  })
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

  return (
    <div style={{backgroundcolor: '#1a1a1a'}}>        
        <div className="chat-container">
        <div className="chat-messages">
            {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
                {msg.isThinking ? (
                <div className="thinking-indicator">
                    <div className="dot-flashing"></div>
                </div>
                ) : (
                <div className="message-content">
                    {msg.parts?.map((part, partIndex) => (
                    part.type === 'code' ? (
                        <div key={partIndex} className="code-block-container">
                        <div className="code-header">
                            <span className="language-tag">
                            {part.language}
                            </span>
                            <button
                            className="copy-button"
                            onClick={() => handleCopy(part.content, msg.id)}
                            >
                            {copiedMessageId === msg.id ? '✅' : '📋'}
                            </button>
                        </div>
                        <SyntaxHighlighter
                            language={part.language}
                            style={vscDarkPlus}
                            className="code-block"
                            wrapLongLines
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
                        className="action-btn copy-btn"
                        onClick={() => handleCopy(msg.content, msg.id)}
                        title="Copy entire response"
                        >
                        {copiedMessageId === msg.id ? '✅ Copied' : '📋 Copy'}
                        </button>
                        <button
                        className="action-btn regenerate-btn"
                        onClick={() => handleRegenerate(msg.id)}
                        disabled={isLoading}
                        title="Regenerate response"
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

        <form onSubmit={handleSubmit} className="chat-input">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
            </button>
        </form>        
        </div>
        <p className='disclaimer'>AI do not save chats yet but it remember last time you chat with it.. i think.. idk</p>
        <p className='disclaimer'>Made By Ahmed Haddaji</p>
    </div>

  );
};

export default Chat;