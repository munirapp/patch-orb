"use client";

import { useState, useMemo, use, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useGetMenusQuery } from "@/lib/features/menus/menuApi";
import { SearchableSelect } from "@/components/SearchableSelect";
import qs from "querystring";
import { Order, OrderConfirmPayload, OrderItem } from "@/interfaces/orders";
import {
  useGetOrderDetailQuery,
  useConfirmOrderMutation,
} from "@/lib/features/orders/orderApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { wait } from "@/lib/utils";
import { useRouter } from "next/navigation";

type PaymentMethod = Order["paymentMethod"] | null;

export default function ConfirmOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  // @ts-ignore
  const { id: idParam } = use(params);
  const id = Number.parseInt(idParam || "0");
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [cashInChange, setCashInChange] = useState("");
  const [provider, setProvider] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [alertStatus, setAlertStatus] = useState<"success" | "error" | null>(
    null
  );
  const [alertMessage, setAlertMessage] = useState("");
  const [isConfirmProcess, setIsConfirmProcess] = useState(false);

  const { data: dataMenus } = useGetMenusQuery(
    qs.stringify({ page: 1, limit: 100 })
  );
  const { data: dataOrderDetail, isSuccess: isSuccessGetOrderDetail } =
    useGetOrderDetailQuery(id);

  const [confirmOrder] = useConfirmOrderMutation();

  const menuOptions = useMemo(() => {
    return (
      dataMenus?.menus?.map((item) => ({
        value: item.id.toString(),
        label: item.name,
      })) || []
    );
  }, [dataMenus]);

  useEffect(() => {
    if (isSuccessGetOrderDetail && selectedItems.length === 0) {
      setSelectedItems(dataOrderDetail.order.items);
    }
  }, [isSuccessGetOrderDetail]);

  const handleSelectedMenuItem = (menuId: string) => {
    setSelectedMenuItem(menuId);

    const menuItem =
      dataMenus?.menus?.find((item) => item.id === Number.parseInt(menuId)) ||
      null;
    if (!menuItem) return;

    setSelectedItems((prev) => {
      const existingItem = prev.find((item) => item.id === menuItem.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === menuItem.id
            ? {
                ...item,
                qty: item.qty + 1,
                totalPrice: item.totalPrice + menuItem.price,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          qty: 1,
          totalPrice: menuItem.price,
        },
      ];
    });
  };

  // Update item quantity
  const updateQuantity = (id: number, change: number) => {
    const menuItem = dataMenus?.menus?.find((item) => item.id === id) || null;
    if (!menuItem) return;

    setSelectedItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.qty + change;
            return newQuantity > 0
              ? {
                  ...item,
                  qty: newQuantity,
                  totalPrice: menuItem.price * newQuantity,
                }
              : null;
          }
          return item;
        })
        .filter((item): item is OrderItem => item !== null);
    });
  };

  // Calculate totals
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Validation
  const isFormValid = useMemo(() => {
    // Must have at least one item
    if (selectedItems.length === 0) return false;

    // Must have payment method selected
    if (!paymentMethod) return false;

    // Check conditional fields based on payment method
    if (paymentMethod === "CASH" && !cashInChange.trim()) return false;
    if (paymentMethod === "DEBIT" && (!provider.trim() || !cardNumber.trim()))
      return false;

    return true;
  }, [selectedItems, paymentMethod, cashInChange, provider, cardNumber]);

  const handleConfirmOrder = async () => {
    if (!isFormValid) return;

    setIsConfirmProcess(true);

    const payment: OrderConfirmPayload["payment"] = { method: paymentMethod! };

    if (paymentMethod === "CASH") {
      payment.cashInChange = Number.parseInt(cashInChange);
    }

    if (paymentMethod === "DEBIT") {
      payment.debitCardNumber = cardNumber;
      payment.debitProvider = provider;
    }

    await confirmOrder({
      id,
      data: {
        menus: selectedItems,
        status: "PAID",
        payment,
      },
    })
      .then(async (res) => {
        if (res?.error) {
          setAlertMessage("failed confirm order, please try again later");
          setAlertStatus("error");
          setIsConfirmProcess(false);
          return;
        }

        setAlertStatus("success");
        setAlertMessage("success confirm order");
        await wait(1000);
        router.push("/orders");
      })
      .catch((error) => {
        console.error(error);
        setAlertMessage("failed confirm order, please try again later");
        setAlertStatus("error");
        setIsConfirmProcess(false);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Confirm Order
        </h1>
      </div>

      {/* Status Messages */}
      {alertStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}

      {alertStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Menu Items */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle className="text-lg font-medium text-slate-900">
              Add Menu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Select Menu Dropdown */}
            <div className="space-y-2">
              <SearchableSelect
                options={menuOptions}
                placeholder="Select menus"
                searchPlaceholder="Search menu's name"
                value={selectedMenuItem}
                onValueChange={handleSelectedMenuItem}
              />
            </div>

            {/* Selected Items List */}
            <div className="space-y-4">
              {selectedItems.length > 0 ? (
                <div className="border border-slate-200 rounded-lg">
                  <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                    {selectedItems.map((item) => (
                      <div
                        key={`${item.id}-${item.name.split(" ").join("")}`}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium text-slate-900">
                            {item.qty}x {item.name}
                          </span>
                          <div className="text-sm text-slate-600">
                            IDR {item.totalPrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-slate-200"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.qty}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-slate-200"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-slate-200 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">
                        IDR {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax (10%)</span>
                      <span className="font-medium">
                        IDR {tax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                      <span>Total</span>
                      <span>IDR {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg p-8 text-center">
                  <p className="text-slate-500">No items selected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Payment Method */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-white">
            <CardTitle className="text-lg font-medium text-slate-900">
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="payment-method"
                className="text-sm font-medium text-slate-700"
              >
                Select Payment Method<span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod as string}
                onValueChange={(value: string) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <SelectTrigger className="border-slate-200 focus:border-slate-300 focus:ring-slate-200">
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">CASH</SelectItem>
                  <SelectItem value="DEBIT">DEBIT</SelectItem>
                  <SelectItem value="QRIS">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields */}
            {paymentMethod === "CASH" && (
              <div className="space-y-2">
                <Label
                  htmlFor="cash-in-change"
                  className="text-sm font-medium text-slate-700"
                >
                  Cash In Change<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cash-in-change"
                  type="number"
                  value={cashInChange}
                  onChange={(e) => setCashInChange(e.target.value)}
                  placeholder="Enter cash amount"
                  className="border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                  required
                />
              </div>
            )}

            {paymentMethod === "DEBIT" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="provider"
                    className="text-sm font-medium text-slate-700"
                  >
                    Provider<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="provider"
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="Enter provider name"
                    className="border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="card-number"
                    className="text-sm font-medium text-slate-700"
                  >
                    Card Number<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="card-number"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Enter card number"
                    className="border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                    required
                  />
                </div>
              </div>
            )}

            {/* Confirm Order Button */}
            <div className="pt-4">
              <Button
                onClick={handleConfirmOrder}
                disabled={!isFormValid || isConfirmProcess}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                size="lg"
              >
                CONFIRM ORDER
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
