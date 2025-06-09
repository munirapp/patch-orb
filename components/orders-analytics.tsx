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

// Mock data for the last 7 days
const chartData = [
  { date: "Dec 15", paidOrders: 12, rejectedOrders: 2 },
  { date: "Dec 16", paidOrders: 15, rejectedOrders: 1 },
  { date: "Dec 17", paidOrders: 8, rejectedOrders: 3 },
  { date: "Dec 18", paidOrders: 18, rejectedOrders: 2 },
  { date: "Dec 19", paidOrders: 22, rejectedOrders: 4 },
  { date: "Dec 20", paidOrders: 16, rejectedOrders: 1 },
  { date: "Dec 21", paidOrders: 20, rejectedOrders: 2 },
];

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

export function OrdersAnalytics() {
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
                <p className="text-2xl font-bold text-green-900">
                  IDR 12,400,000
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
                <p className="text-2xl font-bold text-red-900">IDR 320,000</p>
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
