import { db } from "@/src/db";
import { menus, orders, transactions } from "@/src/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateOrderSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "id is required and must be a number")
    .transform(Number),
  status: z.enum(["PAID", "REJECTED"]),
  menus: z
    .array(
      z.object({
        id: z.number(),
        qty: z.number(),
      })
    )
    .optional(),
  payment: z
    .object({
      method: z.enum(["CASH", "DEBIT", "QRIS"]),
      cashInChange: z.number().optional(),
      debitProvider: z.string().optional(),
      debitCardNumber: z.string().optional(),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;

    const id = parseInt(idParam);

    if (!id) {
      return NextResponse.json(
        {
          message: "failed get order detail",
          data: { errors: "id is required" },
        },
        { status: 400 }
      );
    }

    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));

    if (existingOrder.length === 0) {
      return NextResponse.json({
        message: "failed get order detail",
        data: { errors: "order not found" },
      });
    }

    const dataOrder = existingOrder[0];

    const orderItems = await db
      .select({
        id: menus.id,
        name: menus.name,
        qty: transactions.totalItem,
        totalPrice: transactions.totalPrice,
      })
      .from(transactions)
      .leftJoin(menus, eq(menus.id, transactions.menuId))
      .where(eq(transactions.orderId, dataOrder.id));

    const response = {
      message: "success get data orders",
      data: {
        order: {
          ...dataOrder,
          items: orderItems,
        },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const payload = { ...body, id };

    const validateBodyPayload = updateOrderSchema.safeParse(payload);

    if (!validateBodyPayload.success) {
      return NextResponse.json(
        {
          message: "failed update order",
          data: { errors: validateBodyPayload.error.format() },
        },
        { status: 400 }
      );
    }

    const orderStatus = validateBodyPayload.data.status;

    let orderPayment: any = {
      paymentMethod: null,
      cashInChange: null,
      debitCardNumber: null,
      debitCardProvider: null,
    };

    let correctionPriceItems: any = {};

    if (validateBodyPayload.data.status === "PAID") {
      if (validateBodyPayload.data.payment) {
        orderPayment = {
          paymentMethod: validateBodyPayload.data.payment.method,
        };

        if (validateBodyPayload.data.payment.method === "CASH") {
          if (
            validateBodyPayload.data.payment.cashInChange === null ||
            validateBodyPayload.data.payment.cashInChange === undefined
          ) {
            throw new Error("cash in change is not provided for cash payment");
          }
          orderPayment = {
            ...orderPayment,
            cashInChange: validateBodyPayload.data.payment.cashInChange,
          };
        }

        if (validateBodyPayload.data.payment.method === "DEBIT") {
          if (!validateBodyPayload.data.payment.debitProvider) {
            throw new Error("provider is not provided for debit payment");
          }

          if (!validateBodyPayload.data.payment.debitCardNumber) {
            throw new Error("card number is not provided for debit payment");
          }

          orderPayment = {
            ...orderPayment,
            debitCardNumber: validateBodyPayload.data.payment.debitCardNumber,
            debitProvider: validateBodyPayload.data.payment.debitProvider,
          };
        }
      }

      if (validateBodyPayload.data?.menus?.length) {
        await db.delete(transactions).where(
          and(
            eq(transactions.orderId, validateBodyPayload.data.id),
            inArray(
              transactions.menuId,
              validateBodyPayload.data.menus.map((item) => item.id)
            )
          )
        );

        const detailMenu = await db
          .select()
          .from(menus)
          .where(
            inArray(
              menus.id,
              validateBodyPayload.data.menus.map((item) => item.id)
            )
          );

        correctionPriceItems = {
          totalItems: 0,
          totalPrice: 0,
          totalFinalPrice: 0,
        };

        for (const menu of detailMenu) {
          const selectedMenuPayload = validateBodyPayload.data.menus.find(
            (item) => item.id === menu.id
          );
          if (!selectedMenuPayload) {
            throw new Error("selected menu not found in the database");
          }

          const newTransactions: typeof transactions.$inferInsert = {
            orderId: validateBodyPayload.data.id,
            menuId: menu.id,
            totalItem: selectedMenuPayload.qty,
            totalPrice: (menu?.price || 0) * selectedMenuPayload.qty,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await db.insert(transactions).values(newTransactions);

          correctionPriceItems.totalItems =
            correctionPriceItems.totalItems + newTransactions.totalItem;

          correctionPriceItems.totalPrice =
            correctionPriceItems.totalPrice + newTransactions.totalPrice;
        }

        // calculate final price with tax
        correctionPriceItems.totalFinalPrice =
          correctionPriceItems.totalPrice +
          correctionPriceItems.totalPrice * 0.1;
      }
    }

    await db
      .update(orders)
      .set({ status: orderStatus, ...orderPayment, ...correctionPriceItems })
      .where(eq(orders.id, validateBodyPayload.data.id));

    const response = {
      message: "success update order",
      data: {
        status: orderStatus,
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
