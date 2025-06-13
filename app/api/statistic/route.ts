import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { orders } from "@/src/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // Get latest orders
    const latestOrders = await db
      .select({
        id: orders.id,
        code: orders.code,
        totalItems: orders.totalItems,
        status: orders.status,
        totalFinalPrice: orders.totalFinalPrice,
      })
      .from(orders)
      .orderBy(desc(orders.id))
      .limit(4);

    // Get order analytics
    const orderAnalytics = await db
      .select({
        totalPaidOrders: sql<number>`COALESCE(SUM(CASE WHEN ${orders.status} = 'PAID' THEN ${orders.totalFinalPrice} ELSE 0 END), 0)`,
        totalRejectedOrders: sql<number>`COALESCE(SUM(CASE WHEN ${orders.status} = 'REJECTED' THEN ${orders.totalFinalPrice} ELSE 0 END), 0)`,
      })
      .from(orders);

    // Get order trends for the last 7 days
    const orderTrends = await db.execute(sql`
      WITH date_range AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date as date_val
      ),
      order_stats AS (
        SELECT 
          DATE(created_at) as order_date,
          SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid_orders,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_orders
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(created_at)
      )
      SELECT 
        dr.date_val as order_date,
        COALESCE(os.paid_orders, 0) as paid_orders,
        COALESCE(os.rejected_orders, 0) as rejected_orders
      FROM date_range dr
      LEFT JOIN order_stats os ON dr.date_val = os.order_date
      ORDER BY dr.date_val
    `);

    const transformTrends = orderTrends.rows.reduce(
      (prev, next) => {
        // @ts-ignore
        prev.paid.push({ date: next.order_date, value: next.paid_orders });
        // @ts-ignore
        prev.rejected.push({
          date: next.order_date,
          value: next.rejected_orders,
        });

        return prev;
      },
      { paid: [], rejected: [] }
    );

    const response = {
      message: "success get data statistic",
      data: {
        latestOrder: latestOrders,
        orderAnalytics: {
          totalPaidOrders: Number(orderAnalytics[0].totalPaidOrders),
          totalRejectedOrders: Number(orderAnalytics[0].totalRejectedOrders),
        },
        orderTrends: transformTrends,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
