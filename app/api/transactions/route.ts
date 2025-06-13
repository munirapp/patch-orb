import { db } from "@/src/db";
import { menus, orders, transactions } from "@/src/db/schema";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const queryTransactions = db
      .select({
        id: transactions.id,
        orderCode: orders.code,
        itemName: menus.name,
        itemTotal: transactions.totalItem,
        itemPrice: transactions.totalPrice,
      })
      .from(orders)
      .leftJoin(transactions, eq(orders.id, transactions.orderId))
      .leftJoin(menus, eq(menus.id, transactions.menuId));

    const whereConditions = [eq(orders.status, "PAID")];

    if (code) {
      whereConditions.push(ilike(orders.code, `%${code}%`));
    }

    if (whereConditions.length > 0) {
      queryTransactions.where(and(...whereConditions));
    }

    const dataTransactions = await queryTransactions
      .limit(limit)
      .offset(offset)
      .orderBy(desc(orders.id));

    const totalTransactions =
      (
        await db
          .select({ count: count() })
          .from(orders)
          .leftJoin(transactions, eq(orders.id, transactions.orderId))
          .where(eq(orders.status, "PAID"))
      )?.[0]?.count || 0;

    const totalPages = Math.ceil(totalTransactions / limit);

    const response = {
      message: "success get data transactions",
      data: {
        pagination: {
          totalRows: totalTransactions,
          page,
          totalPages,
          pageSize: limit,
        },
        transactions: dataTransactions,
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
