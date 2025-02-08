import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_LINK;

export const getChats = createAsyncThunk(
  'chat/getChats',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chat?id=${id}`);      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getChatMessages = createAsyncThunk(
  'chat/getChatMessages',
  async ({sessionId}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chat/${sessionId}`);
      const rawMessages = response.data.messages.slice(2);      
      return {
        sessionID: response.data.sessionID,
        messages: rawMessages.map(msg => ({
          id: `${sessionId}-${msg.content.slice(0, 5)}`,
          content: msg.content,
          isUser: msg.role === 'user',
          parts: parseMessage(msg.content)
        }))
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteMsgs = createAsyncThunk(
  'chat/delete',
  async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/empty`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

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

const initialState = {
  chats: null,
  messages: null,  
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearActiveChatMessages: (state) => {
      state.messages = [];
    }
  },
  extraReducers: (builder) => {
    builder


      .addCase(getChats.pending, (state) => {
        state.chatsStatus = 'loading';
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.chatsStatus = 'succeeded';
        state.chats = action.payload.chats;
      })
      .addCase(getChats.rejected, (state, action) => {
        state.chatsStatus = 'failed';
        state.error = action.payload.error;
      })


      .addCase(getChatMessages.pending, (state) => {
        
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.messages = {
          sessionID: action.payload.sessionID,
          messages: action.payload.messages
        };
        })
      .addCase(getChatMessages.rejected, (state, action) => {
        
        state.error = action.payload;
      });
  }
});

export const { clearActiveChatMessages } = chatSlice.actions;
export default chatSlice.reducer;