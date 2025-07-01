import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "project",
  initialState: {
    list: [], // ✅ यह default होना ज़रूरी है
  },
  reducers: {
    setProjects: (state, action) => {
      state.list = action.payload;
    },
    resetProjects: (state) => {
      state.list = [];
    },
  },
});

export const { setProjects, resetProjects } = projectSlice.actions;
export default projectSlice.reducer;
