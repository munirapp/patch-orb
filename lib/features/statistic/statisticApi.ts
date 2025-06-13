import { GetStatisticResponse } from "@/interfaces/statistic";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const statisticApi = createApi({
  reducerPath: "statisticApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getStatistic: builder.query<GetStatisticResponse["data"], void>({
      query: () => {
        return {
          url: `/statistic`,
          method: "GET",
        };
      },
      transformResponse: (response: GetStatisticResponse) => response.data,
    }),
  }),
});

export const { useGetStatisticQuery } = statisticApi;
