import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/src/db";
import { menus } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { deleteImage, uploadImage } from "@/lib/server_utils";

const updateMenuSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "id is required and must be a number")
    .transform(Number),
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
          message: "failed get menu detail",
          data: { errors: "id is required" },
        },
        { status: 400 }
      );
    }

    const existingMenu = await db.select().from(menus).where(eq(menus.id, id));

    if (existingMenu.length === 0) {
      return NextResponse.json(
        {
          message: "failed get menu detail",
          data: { errors: "menu not found" },
        },
        { status: 404 }
      );
    }

    const response = {
      message: "success get menu detail",
      data: { menu: existingMenu[0] },
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
    const formData = await request.formData();

    const { id } = await params;

    const textPayload = {
      id,
      name: formData.get("name"),
      category: formData.get("category"),
      description: formData.get("description"),
      stock: formData.get("stock"),
      price: formData.get("price"),
    };

    const validateTextPayload = updateMenuSchema.safeParse(textPayload);

    if (!validateTextPayload.success) {
      return NextResponse.json(
        {
          message: "failed update menu",
          data: { errors: validateTextPayload.error.format() },
        },
        { status: 400 }
      );
    }

    const previousMenu = await db
      .select()
      .from(menus)
      .where(eq(menus.id, validateTextPayload.data.id));

    if (previousMenu.length === 0) {
      return NextResponse.json(
        {
          message: "failed update menu",
          data: { errors: "menus is not found" },
        },
        { status: 404 }
      );
    }

    const image = formData.get("image");

    let imageLink = "";

    const previousImageLink =
      (
        await db
          .select({ image: menus.image })
          .from(menus)
          .where(eq(menus.id, validateTextPayload.data.id))
      )?.[0]?.image || "";

    if (image && image instanceof File) {
      imageLink = await uploadImage(
        image,
        validateTextPayload.data.name,
        "/images"
      );

      if (previousImageLink) {
        deleteImage(previousImageLink);
      }
    }

    await db
      .update(menus)
      .set({
        ...validateTextPayload.data,
        image: imageLink || previousImageLink,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(menus.id, validateTextPayload.data.id));

    const response = {
      message: "success update menu",
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (!id) {
      return NextResponse.json(
        {
          message: "failed delete menu",
          data: { errors: "id is required" },
        },
        { status: 400 }
      );
    }

    const previousMenu = await db.select().from(menus).where(eq(menus.id, id));

    if (previousMenu.length === 0) {
      return NextResponse.json(
        {
          message: "failed delete menu",
          data: { errors: "menus is not found" },
        },
        { status: 404 }
      );
    }

    await db
      .delete(menus)
      .where(eq(menus.id, id))
      .catch((error) => {
        throw error;
      });

    if (previousMenu?.[0]?.image) {
      deleteImage(previousMenu[0].image);
    }

    const response = {
      message: "success delete menu",
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
