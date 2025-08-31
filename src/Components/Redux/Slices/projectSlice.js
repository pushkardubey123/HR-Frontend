import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "project",
  initialState: {
    list: [],
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
