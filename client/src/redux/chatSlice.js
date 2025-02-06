import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_LINK;

export const getChats = createAsyncThunk(
  'chat/getChats',
  async ({ id }, { rejectWithValue }) => {
    try {
      const result = await axios.get(`${BASE_URL}/api/chat`, { params: { id } });
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getChatMessages = createAsyncThunk(
  'chat/getChatMessages',
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      const result = await axios.get(`${BASE_URL}/api/chat/${sessionId}`);
      return { sessionId, messages: result.data.messages };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  chats: [],
  activeChatMessages: [],
  activeChatSessionId: null,
  chatsStatus: 'idle',
  messagesStatus: 'idle',
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearActiveChatMessages(state) {
      state.activeChatMessages = [];
      state.activeChatSessionId = null;
      state.messagesStatus = 'idle';
    },
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
        state.error = action.payload;
      })
      
      .addCase(getChatMessages.pending, (state) => {
        state.messagesStatus = 'loading';
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.messagesStatus = 'succeeded';
        state.activeChatSessionId = action.payload.sessionId;
        state.activeChatMessages = action.payload.messages;
      })
      .addCase(getChatMessages.rejected, (state, action) => {
        state.messagesStatus = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearActiveChatMessages } = chatSlice.actions;

export default chatSlice.reducer;
