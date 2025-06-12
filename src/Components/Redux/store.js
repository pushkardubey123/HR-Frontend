// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { combineReducers } from "redux";
import pendingUserReducer from "./Slices/pendingUserSlice"
// import other slices...

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["pending"], // ✅ Add slice names you want to persist
};

const rootReducer = combineReducers({
  pendingUsers: pendingUserReducer  
  // add more reducers here
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
