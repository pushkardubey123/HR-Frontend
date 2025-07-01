// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { combineReducers } from "redux";
import pendingUserReducer from "./Slices/pendingUserSlice"
import projectReducer from "./Slices/projectSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["pending","project"], // ✅ Add slice names you want to persist
};

const rootReducer = combineReducers({
  pendingUsers: pendingUserReducer ,
  project: projectReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Important: avoid warnings
    }),
});

export const persistor = persistStore(store);
