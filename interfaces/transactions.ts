import type { GenericPagination, GenericResponse } from "./generic";

export interface Transaction {
  id: number;
  orderCode: string;
  itemName: string;
  itemTotal: number;
  itemPrice: number;
}

export interface GetTransactionResponse
  extends GenericResponse<{
    pagination: GenericPagination;
    transactions: Transaction[];
  }> {}
