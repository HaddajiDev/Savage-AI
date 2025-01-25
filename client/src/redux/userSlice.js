import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_LINK;

export const userRegister = createAsyncThunk("user/register", async(user, {rejectWithValue})=>{
	try {
		let response = await axios.post(`${BASE_URL}/user/signup`, user);
		return await response.data;
	} catch (error) {
		console.log(error);
		return rejectWithValue(error.response.data)
	}
});

export const userLogin = createAsyncThunk("user/login", async(user, {rejectWithValue})=>{
	try {
		let response = await axios.post(`${BASE_URL}/user/login`, user);
		return response.data;
	} catch (error) {
		console.log(error);
		return rejectWithValue(error.response.data)
	}
});

const initialState = {
    user: null,
    status: null,  
    error: null,  
    token: null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {

    }
})


export const {} = userSlice.actions

export default userSlice.reducer