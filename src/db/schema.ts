import { pgTable, unique, bigint, text, timestamp, doublePrecision, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const menus = pgTable("menus", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "menus_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: text(),
	category: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	price: bigint({ mode: "number" }),
	image: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	stock: bigint({ mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	description: text(),
}, (table) => [
	unique("menus_id_key").on(table.id),
]);

export const orders = pgTable("orders", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "orders_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	code: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalItems: bigint("total_items", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalPrice: bigint("total_price", { mode: "number" }),
	taxPercent: doublePrecision("tax_percent"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalFinalPrice: bigint("total_final_price", { mode: "number" }),
	status: text(),
	paymentMethod: text("payment_method"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	cashInChange: bigint("cash_in_change", { mode: "number" }),
	debitProvider: text("debit_provider"),
	debitCardNumber: text("debit_card_number"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("orders_id_key").on(table.id),
]);

export const transactions = pgTable("transactions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "transactions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	orderId: bigint("order_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	menuId: bigint("menu_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalItem: bigint("total_item", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalPrice: bigint("total_price", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.menuId],
			foreignColumns: [menus.id],
			name: "transactions_menu_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "transactions_order_id_fkey"
		}).onDelete("restrict"),
	unique("transactions_id_key").on(table.id),
]);

export const admin = pgTable("admin", {
	id: text().primaryKey().notNull(),
	username: text(),
	password: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});
