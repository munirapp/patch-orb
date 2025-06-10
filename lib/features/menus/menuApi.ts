import type {
  GetMenuDetailResponse,
  GetMenuResponse,
  Menu,
} from "@/interfaces/menus";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const menuApi = createApi({
  reducerPath: "menuApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Menus"],
  endpoints: (builder) => ({
    getMenus: builder.query<GetMenuResponse["data"], string>({
      query: (params) => {
        return {
          url: `/menus?${params}`,
          method: "GET",
        };
      },
      providesTags: ["Menus"],
      transformResponse: (response: GetMenuResponse) => response.data,
    }),
    getMenuDetail: builder.query<GetMenuDetailResponse["data"], number>({
      query: (id) => ({
        url: `/menus/${id}`,
        method: "GET",
      }),
      providesTags: ["Menus"],
      transformResponse: (response: GetMenuDetailResponse) => response.data,
    }),
    addMenu: builder.mutation({
      query: (formData) => ({
        url: "/menus",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Menus"],
    }),
    updateMenu: builder.mutation<any, { id: number; data: any }>({
      query: (payload) => ({
        url: `/menus/${payload.id}`,
        method: "PUT",
        body: payload.data,
      }),
      invalidatesTags: ["Menus"],
    }),
    deleteMenu: builder.mutation<any, number>({
      query: (id) => ({
        url: `/menus/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Menus"],
    }),
  }),
});

export const {
  useGetMenusQuery,
  useGetMenuDetailQuery,
  useAddMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
} = menuApi;
