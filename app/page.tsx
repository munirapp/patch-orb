"use client";

import { LatestOrders } from "@/components/latest-orders";
import { OrdersAnalytics } from "@/components/orders-analytics";
import { useGetStatisticQuery } from "@/lib/features/statistic/statisticApi";

export default function Dashboard() {
  const { data: dataStatistic, isLoading } = useGetStatisticQuery();

  if (isLoading || !dataStatistic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <LatestOrders latestOrders={dataStatistic.latestOrder} />
        </div>
        <div className="lg:col-span-1">
          <OrdersAnalytics data={dataStatistic} />
        </div>
      </div>
    </div>
  );
}
