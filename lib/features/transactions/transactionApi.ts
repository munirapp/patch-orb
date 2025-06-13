import { GetTransactionResponse } from "@/interfaces/transactions";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const transactionApi = createApi({
  reducerPath: "transactionApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getTransactions: builder.query<GetTransactionResponse["data"], string>({
      query: (params) => {
        return {
          url: `/transactions?${params}`,
          method: "GET",
        };
      },
      transformResponse: (response: GetTransactionResponse) => response.data,
    }),
  }),
});

export const { useGetTransactionsQuery } = transactionApi;
