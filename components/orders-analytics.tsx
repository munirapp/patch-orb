"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GetStatisticResponse } from "@/interfaces/statistic";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-3">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-green-600">
              Paid Orders: {payload[0]?.value}
            </p>
            <p className="text-sm text-red-600">
              Rejected Orders: {payload[1]?.value}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
};

interface OrdersAnalyticsProps {
  data: GetStatisticResponse["data"];
}

export function OrdersAnalytics({ data }: OrdersAnalyticsProps) {
  // Transform the data for the chart
  const chartData = data?.orderTrends.paid.map((paidItem, index) => ({
    date: paidItem.date,
    paidOrders: paidItem.value,
    rejectedOrders: data.orderTrends.rejected[index]?.value || 0,
  }));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-900">
          Orders Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Total Paid Orders
                </p>
                <p className="text-xl font-bold text-green-900">
                  <span className="text-sm mr-1">IDR </span>
                  {data?.orderAnalytics?.totalPaidOrders?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">
                  Total Rejected Orders
                </p>
                <p className="text-xl font-bold text-red-900">
                  <span className="text-sm mr-1">IDR </span>
                  {data?.orderAnalytics?.totalRejectedOrders?.toLocaleString() ||
                    0}
                </p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-900">
            Orders Trend (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="paidOrders"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="rejectedOrders"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-600">Paid Orders</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-600">Rejected Orders</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
