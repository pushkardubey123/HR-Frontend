import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getAuthConfig = () => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchPendingUsers = createAsyncThunk("pending/fetch", async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/user/pending-users`,
    getAuthConfig()
  );
  return res.data.data;
});

export const approveUser = createAsyncThunk("pending/approve", async (id) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/user/approve-user/${id}`,
    {},
    getAuthConfig()
  );
  return { id };
});

export const rejectUser = createAsyncThunk("pending/reject", async (id) => {
  await axios.delete(
    `${import.meta.env.VITE_API_URL}/pending/reject/${id}`,
    getAuthConfig()
  );
  return id;
});

const pendingUserSlice = createSlice({
  name: "pendingUsers",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPendingUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(approveUser.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (user) => user._id !== action.payload.id
        );
      })

      .addCase(rejectUser.fulfilled, (state, action) => {
        state.data = state.data.filter((user) => user._id !== action.payload);
      });
  },
});

export default pendingUserSlice.reducer;
