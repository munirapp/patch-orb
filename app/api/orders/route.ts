import { db } from "@/src/db";
import { orders } from "@/src/db/schema";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = (page - 1) * limit;

    const queryOrders = db.select().from(orders);

    const whereConditions = [];

    if (code) {
      whereConditions.push(ilike(orders.code, `%${code}%`));
    }

    if (whereConditions.length > 0) {
      queryOrders.where(and(...whereConditions));
    }

    const dataOrders = await queryOrders
      .limit(limit)
      .offset(offset)
      .orderBy(desc(orders.id));

    const totalOrders =
      (await db.select({ count: count() }).from(orders))?.[0]?.count || 0;

    const totalPages = Math.ceil(totalOrders / limit);

    const response = {
      message: "success get data orders",
      data: {
        pagination: {
          totalRows: totalOrders,
          page,
          totalPages,
          pageSize: limit,
        },
        orders: dataOrders,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock response based on Postman collection
    const response = {
      message: "success add order",
      data: {
        code: "Q8R2T9",
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
