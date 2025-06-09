import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const latestOrders = [
  { id: "XYZ010", items: 10, status: "UNPAID", total: 30000 },
  { id: "XYZ009", items: 8, status: "PAID", total: 45000 },
  { id: "XYZ008", items: 5, status: "PAID", total: 25000 },
  { id: "XYZ007", items: 12, status: "PAID", total: 67500 },
];

export function LatestOrders() {
  const getStatusBadge = (status: string) => {
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
                <p className="font-medium text-slate-900">{order.id}</p>
                <p className="text-sm text-slate-600">Items: {order.items}</p>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">
                  IDR {order.total.toLocaleString()}
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
