CREATE TYPE "public"."item_content_type" AS ENUM('text', 'file', 'url');--> statement-breakpoint
CREATE TABLE "collections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"default_type_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_tags" (
	"item_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "item_tags_item_id_tag_id_pk" PRIMARY KEY("item_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "item_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(64) NOT NULL,
	"color" varchar(32) NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type_id" text NOT NULL,
	"collection_id" text,
	"title" varchar(200) NOT NULL,
	"content_type" "item_content_type" NOT NULL,
	"content" text,
	"file_url" text,
	"file_name" varchar(255),
	"file_size" integer,
	"url" text,
	"description" text,
	"language" varchar(64),
	"is_favorite" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_pro" boolean DEFAULT false NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_default_type_id_item_types_id_fk" FOREIGN KEY ("default_type_id") REFERENCES "public"."item_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_types" ADD CONSTRAINT "item_types_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_type_id_item_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."item_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collections_user_id_idx" ON "collections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "collections_user_created_at_idx" ON "collections" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "collections_user_is_favorite_idx" ON "collections" USING btree ("user_id","is_favorite");--> statement-breakpoint
CREATE INDEX "item_tags_item_id_idx" ON "item_tags" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "item_tags_tag_id_idx" ON "item_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "item_types_user_id_idx" ON "item_types" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "item_types_user_name_unique" ON "item_types" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "items_user_id_idx" ON "items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "items_user_created_at_idx" ON "items" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "items_user_is_favorite_idx" ON "items" USING btree ("user_id","is_favorite");--> statement-breakpoint
CREATE INDEX "items_user_is_pinned_idx" ON "items" USING btree ("user_id","is_pinned");--> statement-breakpoint
CREATE INDEX "items_type_id_idx" ON "items" USING btree ("type_id");--> statement-breakpoint
CREATE INDEX "items_collection_id_idx" ON "items" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "tags_user_id_idx" ON "tags" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_name_unique" ON "tags" USING btree ("user_id","name");