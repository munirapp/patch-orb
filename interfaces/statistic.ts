import type { GenericResponse } from "./generic";
import { Order } from "./orders";

export interface StatisticChartValue {
  date: string;
  value: number;
}

export interface GetStatisticResponse
  extends GenericResponse<{
    latestOrder: Order[];
    orderAnalytics: { totalPaidOrders: number; totalRejectedOrders: number };
    orderTrends: {
      paid: StatisticChartValue[];
      rejected: StatisticChartValue[];
    };
  }> {}
