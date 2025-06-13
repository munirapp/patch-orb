import type { GenericPagination, GenericResponse } from "./generic";

export interface OrderItem {
  id: number;
  name: string;
  qty: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  code: string;
  totalItems: number;
  totalPrice: number;
  taxPercent: number;
  totalFinalPrice: number;
  status: "UNPAID" | "PAID" | "REJECTED";
  paymentMethod: "CASH" | "DEBIT" | "QRIS";
  cashInChange: number;
  debitProvider: string;
  debitCardNumber: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

export interface OrderConfirmPayload {
  status: Order["status"];
  menus?: OrderItem[];
  payment: {
    method: Order["paymentMethod"];
    cashInChange?: Order["cashInChange"];
    debitProvider?: Order["debitProvider"];
    debitCardNumber?: Order["debitCardNumber"];
  };
}

export interface GetOrderResponse
  extends GenericResponse<{ pagination: GenericPagination; orders: Order[] }> {}

export interface GetOrderDetailResponse
  extends GenericResponse<{ order: OrderDetail }> {}
