import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { menus } from "@/src/db/schema";
import { eq, count, ilike, and, gt, desc } from "drizzle-orm";
import { z } from "zod";
import { uploadImage } from "@/lib/server_utils";

const addMenuSchema = z.object({
  name: z.string().min(1, "name is required"),
  category: z.string().min(1, "category is required"),
  description: z.string().min(1, "description is required"),
  stock: z
    .string()
    .regex(/^\d+$/, "Stock is required and must be a number")
    .transform(Number),
  price: z
    .string()
    .regex(/^\d+$/, "Price is required and must be a number")
    .transform(Number),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const category = searchParams.get("category");
    const withStock = searchParams.get("withStock") || false;
    const offset = (page - 1) * limit;

    const queryMenus = db.select().from(menus);

    const whereConditions = [];

    if (name) {
      whereConditions.push(ilike(menus.name, `%${name}%`));
    }

    if (category) {
      whereConditions.push(eq(menus.category, category));
    }

    if (withStock) {
      whereConditions.push(gt(menus.stock, 0));
    }

    if (whereConditions.length > 0) {
      queryMenus.where(and(...whereConditions));
    }

    const dataMenus = await queryMenus
      .limit(limit)
      .offset(offset)
      .orderBy(desc(menus.id));

    const totalMenus =
      (await db.select({ count: count() }).from(menus))?.[0]?.count || 0;

    const totalPages = Math.ceil(totalMenus / limit);

    const response = {
      message: "success get menus",
      data: {
        pagination: {
          totalRows: totalMenus,
          page,
          totalPages,
          pageSize: limit,
        },
        menus: dataMenus,
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
    const formData = await request.formData();

    const textPayload = {
      name: formData.get("name"),
      category: formData.get("category"),
      description: formData.get("description"),
      stock: formData.get("stock"),
      price: formData.get("price"),
    };

    const validateTextPayload = addMenuSchema.safeParse(textPayload);

    if (!validateTextPayload.success) {
      return NextResponse.json(
        {
          message: "failed insert new menu",
          data: { errors: validateTextPayload.error.format() },
        },
        { status: 400 }
      );
    }

    const image = formData.get("image");

    let imageLink = "";

    if (image && image instanceof File) {
      imageLink = await uploadImage(
        image,
        validateTextPayload.data.name,
        "/images"
      );
    }

    const newMenu: typeof menus.$inferInsert = {
      ...validateTextPayload.data,
      image: imageLink,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert(menus).values(newMenu);

    const response = {
      message: "success insert new menu",
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
