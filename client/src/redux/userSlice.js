import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_LINK;

export const userRegister = createAsyncThunk("user/register", async(user, {rejectWithValue})=>{
	try {
		let response = await axios.post(`${BASE_URL}/user/api/verify`, user);
		return await response.data;
	} catch (error) {
		const errorData = error.response?.data;
        return rejectWithValue({
            error: errorData?.error || 'Registration failed. Please try again.'
        });
	}
});


export const userLogin = createAsyncThunk("user/login", async(user, {rejectWithValue})=>{
	try {
		let response = await axios.post(`${BASE_URL}/user/login`, user);
		return response.data;
	} catch (error) {
		const errorData = error.response?.data;
        return rejectWithValue({
            error: errorData?.error || 'Login failed. Please try again.'
        });
	}
});

export const currentUser = createAsyncThunk('user/current', async() => {
    try {
        let result = await axios.get(BASE_URL + '/user/current', {
            headers:{
                Authorization: localStorage.getItem("token"),
            }
        });
        return result.data;
    } catch (error) {
        console.log(error);
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
		logout(state){
			localStorage.removeItem("token");
			state.user = null;
			state.token = null;
			window.location.reload();
		},
		setToken: (state, action) => {
            state.token = action.payload;
            localStorage.setItem("token", action.payload);
			window.location.reload();
        },
		clearError(state) {
			state.error = null;
		}

    },
    extraReducers: (builder) => {
		builder
		.addCase(userLogin.pending, (state, action) => {		
			state.status = "pending";
			state.error = null;
		})
		.addCase(userLogin.fulfilled, (state, action) => {
			state.status = "success";
			state.user = action.payload?.user;
			localStorage.setItem("token", action.payload.token);
			window.location.reload();
		})
		.addCase(userLogin.rejected, (state, action) => {
			state.status = "failed";
			state.error = action.payload.error || 'Something went wrong';
		})
	
		//signInup
		.addCase(userRegister.pending, (state) => {
			state.status = "pending";
			state.error = null;
		})
		.addCase(userRegister.fulfilled, (state, action) => {
			state.status = "success";
			window.location.href = action.payload.redirectUrl;
		})
		.addCase(userRegister.rejected, (state, action) => {
			state.status = "failed";
			state.error = action.payload.error || 'Something went wrong';
		})


		.addCase(currentUser.fulfilled, (state, action) => {
            state.user = action.payload?.user || null;            
        })
    }
})


export const { logout, setToken, clearError } = userSlice.actions

export default userSlice.reducer