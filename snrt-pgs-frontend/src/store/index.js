// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import offerReducer from './slices/offerSlice';
import resultReducer from './slices/resultSlice'; // ✅ AJOUTER

const store = configureStore({
    reducer: {
        auth: authReducer,
        offers: offerReducer,
        results: resultReducer, // ✅ AJOUTER
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;