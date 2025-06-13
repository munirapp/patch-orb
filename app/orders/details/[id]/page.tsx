"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useGetOrderDetailQuery } from "@/lib/features/orders/orderApi";
import { Order } from "@/interfaces/orders";

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  // @ts-ignore
  const { id: idParam } = use(params);
  const id = parseInt(idParam);
  const [isLoading, setIsLoading] = useState(true);

  const { data: dataDetailOrder, isSuccess: isSuccessGetOrderDetail } =
    useGetOrderDetailQuery(id);

  useEffect(() => {
    if (isSuccessGetOrderDetail) {
      setIsLoading(false);
    }
  }, [isSuccessGetOrderDetail]);

  const generateOrderStatus = (status: Order["status"]) => {
    if (status === "PAID")
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm font-medium text-green-800">{status}</span>
          </div>
        </div>
      );

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
          <span className="text-sm font-medium text-red-800">{status}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!dataDetailOrder?.order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Order not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Order Details
          </h1>
          <p className="text-slate-600 mt-1">{dataDetailOrder.order.code}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Order Items */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle className="text-lg font-medium text-slate-900">
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <div className="p-6 space-y-4">
                {dataDetailOrder.order.items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 mb-2">
                          {item.name}
                        </h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex justify-between">
                            <span>Quantity:</span>
                            <span className="font-medium">{item.qty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price per item:</span>
                            <span className="font-medium">
                              IDR {item.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Order Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle className="text-lg font-medium text-slate-900">
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Payment Method Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-slate-900">
                Payment Method
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Method:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {dataDetailOrder.order.paymentMethod}
                  </span>
                </div>

                {/* Conditional Payment Details */}
                {dataDetailOrder.order.paymentMethod === "CASH" && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">
                      Cash In Change:
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      IDR{" "}
                      {dataDetailOrder.order.cashInChange.toLocaleString() || 0}
                    </span>
                  </div>
                )}

                {dataDetailOrder.order.paymentMethod === "DEBIT" && (
                  <>
                    {dataDetailOrder.order.debitProvider && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">
                          Provider:
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {dataDetailOrder.order.debitProvider}
                        </span>
                      </div>
                    )}
                    {dataDetailOrder.order.debitCardNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">
                          Card Number:
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {dataDetailOrder.order.debitCardNumber}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {dataDetailOrder.order.paymentMethod === "QRIS" && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Payment via:</span>
                    <span className="text-sm font-medium text-slate-900">
                      QR Code Scan
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-slate-900">
                Order Summary
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-900">
                    IDR {dataDetailOrder.order.totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (10%):</span>
                  <span className="font-medium text-slate-900">
                    IDR{" "}
                    {(
                      dataDetailOrder.order.totalPrice *
                      dataDetailOrder.order.taxPercent
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-slate-900">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      IDR{" "}
                      {dataDetailOrder.order.totalFinalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-slate-900">Status</h3>
              {generateOrderStatus(dataDetailOrder.order.status)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
