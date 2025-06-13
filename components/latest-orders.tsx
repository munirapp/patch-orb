import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Order } from "@/interfaces/orders";

export interface LatestOrdersProps {
  latestOrders: Order[];
}

export function LatestOrders({ latestOrders }: LatestOrdersProps) {
  const getStatusBadge = (status: Order["status"]) => {
    if (status === "PAID") {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100 text-xs"
        >
          PAID
        </Badge>
      );
    }

    if (status === "REJECTED") {
      return (
        <Badge
          variant="default"
          className="bg-red-100 text-red-800 hover:bg-red-100 text-xs"
        >
          REJECTED
        </Badge>
      );
    }

    return (
      <Badge
        variant="secondary"
        className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-xs"
      >
        UNPAID
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-900">
          Latest Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {latestOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-slate-900">{order.code}</p>
                <p className="text-sm text-slate-600">
                  Items: {order.totalItems}
                </p>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">
                  IDR {order.totalFinalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
        <Link href="/orders">
          <Button className="w-full mt-4" variant="outline">
            View All Orders
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
