import {
  GetOrderDetailResponse,
  GetOrderResponse,
  OrderConfirmPayload,
} from "@/interfaces/orders";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getOrders: builder.query<GetOrderResponse["data"], string>({
      query: (params) => {
        return {
          url: `/orders?${params}`,
          method: "GET",
        };
      },
      providesTags: ["Orders"],
      transformResponse: (response: GetOrderResponse) => response.data,
    }),
    getOrderDetail: builder.query<GetOrderDetailResponse["data"], number>({
      query: (id) => {
        return {
          url: `/orders/${id}`,
          method: "GET",
        };
      },
      providesTags: ["Orders"],
      transformResponse: (response: GetOrderDetailResponse) => response.data,
    }),
    confirmOrder: builder.mutation<
      any,
      { id: number; data: OrderConfirmPayload }
    >({
      query: (payload) => ({
        url: `/orders/${payload.id}`,
        method: "PUT",
        body: payload.data,
      }),
      invalidatesTags: ["Orders"],
    }),
    rejectOrder: builder.mutation<any, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "PUT",
        body: { status: "REJECTED" },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderDetailQuery,
  useConfirmOrderMutation,
  useRejectOrderMutation,
} = orderApi;
