import type { GenericPagination, GenericResponse } from "./generic";

export interface Menu {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  description: string;
  category: string;
}

export interface GetMenuResponse
  extends GenericResponse<{ pagination: GenericPagination; menus: Menu[] }> {}

export interface GetMenuDetailResponse
  extends GenericResponse<{ menu: Menu }> {}
