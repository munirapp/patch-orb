import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { menuApi } from "./features/menus/menuApi";
import { orderApi } from "./features/orders/orderApi";
import { transactionApi } from "./features/transactions/transactionApi";
import { statisticApi } from "./features/statistic/statisticApi";

// Create the store
export const store = configureStore({
  reducer: {
    [menuApi.reducerPath]: menuApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [statisticApi.reducerPath]: statisticApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      menuApi.middleware,
      orderApi.middleware,
      transactionApi.middleware,
      statisticApi.middleware
    ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
