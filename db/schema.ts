import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const itemContentTypeEnum = pgEnum("item_content_type", [
  "text",
  "file",
  "url",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isPro: boolean("is_pro").notNull().default(false),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const itemTypes = pgTable(
  "item_types",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 64 }).notNull(),
    color: varchar("color", { length: 32 }).notNull(),
    isSystem: boolean("is_system").notNull().default(false),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("item_types_user_id_idx").on(table.userId),
    uniqueIndex("item_types_user_name_unique").on(table.userId, table.name),
  ],
);

export const collections = pgTable(
  "collections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    defaultTypeId: text("default_type_id").references(() => itemTypes.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("collections_user_id_idx").on(table.userId),
    index("collections_user_created_at_idx").on(table.userId, table.createdAt),
    index("collections_user_is_favorite_idx").on(table.userId, table.isFavorite),
  ],
);

export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    typeId: text("type_id")
      .notNull()
      .references(() => itemTypes.id, { onDelete: "restrict" }),
    collectionId: text("collection_id").references(() => collections.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 200 }).notNull(),
    contentType: itemContentTypeEnum("content_type").notNull(),
    content: text("content"),
    fileUrl: text("file_url"),
    fileName: varchar("file_name", { length: 255 }),
    fileSize: integer("file_size"),
    url: text("url"),
    description: text("description"),
    language: varchar("language", { length: 64 }),
    isFavorite: boolean("is_favorite").notNull().default(false),
    isPinned: boolean("is_pinned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("items_user_id_idx").on(table.userId),
    index("items_user_created_at_idx").on(table.userId, table.createdAt),
    index("items_user_is_favorite_idx").on(table.userId, table.isFavorite),
    index("items_user_is_pinned_idx").on(table.userId, table.isPinned),
    index("items_type_id_idx").on(table.typeId),
    index("items_collection_id_idx").on(table.collectionId),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("tags_user_id_idx").on(table.userId),
    uniqueIndex("tags_user_name_unique").on(table.userId, table.name),
  ],
);

export const itemTags = pgTable(
  "item_tags",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.itemId, table.tagId] }),
    index("item_tags_item_id_idx").on(table.itemId),
    index("item_tags_tag_id_idx").on(table.tagId),
  ],
);
