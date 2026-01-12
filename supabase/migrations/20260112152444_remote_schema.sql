


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."auto_finalize_crowdfund"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only perform the update if the flag isn't already set
  -- This prevents the infinite recursion (Stack Depth Error)
  IF (NEW.is_crowdfund_master = false OR NEW.is_crowdfund_master IS NULL) THEN
    -- Your logic here to determine if it should be master
    -- Ensure the UPDATE statement has a WHERE clause that prevents re-triggering
    UPDATE public.orders 
    SET is_crowdfund_master = true 
    WHERE id = NEW.id 
    AND is_crowdfund_master IS DISTINCT FROM true;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_finalize_crowdfund"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."contribute_to_crowdfund"("item_id" "uuid", "amount" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE wishlist_items
  SET current_amount = COALESCE(current_amount, 0) + amount
  WHERE id = item_id;

  -- Automatically mark as claimed if goal is reached
  UPDATE wishlist_items
  SET status = 'claimed'
  WHERE id = item_id AND current_amount >= target_amount;
END;
$$;


ALTER FUNCTION "public"."contribute_to_crowdfund"("item_id" "uuid", "amount" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_item_quantity"("row_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE wishlist_items
  SET quantity = quantity - 1,
      status = CASE WHEN (quantity - 1) <= 0 THEN 'claimed' ELSE 'available' END
  WHERE id = row_id;
END;
$$;


ALTER FUNCTION "public"."decrement_item_quantity"("row_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_item_raised"("row_id" "uuid", "amount_to_subtract" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE wishlist_items
  SET amount_raised = COALESCE(amount_raised, 0) - amount_to_subtract
  WHERE id = row_id;
END;
$$;


ALTER FUNCTION "public"."decrement_item_raised"("row_id" "uuid", "amount_to_subtract" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_account"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."delete_user_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_full_account"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."delete_user_full_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_rejected_order"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if the gift_status was changed to 'rejected'
  IF (NEW.gift_status = 'rejected' AND OLD.gift_status != 'rejected') THEN
    
    -- Option A: If you use a 'quantity' column
    UPDATE public.wishlist_items
    SET quantity = quantity + 1
    WHERE id = NEW.item_id;

    /* -- Option B: If you use a 'is_purchased' boolean
    UPDATE public.wishlist_items
    SET is_purchased = false
    WHERE id = NEW.item_id;
    */

  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_rejected_order"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_transaction_refund"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    target_order_id UUID;
    target_item_id UUID;
    refund_amount NUMERIC;
BEGIN
    -- Only run if status changes to 'refunded' or 'disputed'
    IF (NEW.status = 'refund' OR NEW.status = 'disputed') AND (OLD.status != NEW.status) THEN
        
        -- 1. Find the Order associated with this transaction
        SELECT id, item_id, total_amount 
        INTO target_order_id, target_item_id, refund_amount
        FROM public.orders 
        WHERE id = NEW.order_id;

        IF target_order_id IS NOT NULL THEN
            -- 2. Mark the Order as Refunded
            UPDATE public.orders
            SET payment_status = 'refunded'
            WHERE id = target_order_id;

            -- 3. Update the Wishlist Item
            UPDATE public.wishlist_items
            SET 
                -- Subtract the amount, but don't go below 0
                amount_raised = GREATEST(amount_raised - refund_amount, 0),
                -- Re-open the item
                status = 'available',
                -- Restore quantity if it was set to 0 during 'claimed' status
                quantity = CASE 
                    WHEN quantity = 0 THEN 1 
                    ELSE quantity 
                END
            WHERE id = target_item_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_transaction_refund"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_creator_balance"("user_id" "uuid", "amount_to_add" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE creator_profiles
  SET withdrawable_balance = COALESCE(withdrawable_balance, 0) + amount_to_add
  WHERE id = user_id;
END;
$$;


ALTER FUNCTION "public"."increment_creator_balance"("user_id" "uuid", "amount_to_add" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_item_raised"("row_id" "uuid", "amount_to_add" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE wishlist_items
  SET 
    amount_raised = COALESCE(amount_raised, 0) + amount_to_add,
    -- Only auto-claim if it's NOT the General Fund
    status = CASE 
      WHEN is_general_fund = false 
           AND (COALESCE(amount_raised, 0) + amount_to_add) >= (price * quantity) 
      THEN 'claimed'
      ELSE status
    END
  WHERE id = row_id;
END;
$$;


ALTER FUNCTION "public"."increment_item_raised"("row_id" "uuid", "amount_to_add" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE wishlist_items
  SET amount_raised = COALESCE(amount_raised, 0) + increment_by
  WHERE id = row_id;
END;
$$;


ALTER FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE wishlist_items
  SET amount_raised = COALESCE(amount_raised, 0) + increment_by
  WHERE id = row_id;
END;
$$;


ALTER FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_refund_rollback"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_item_id UUID;
    v_refund_amount_inr NUMERIC;
BEGIN
    -- Only trigger when status changes to 'refund'
    IF (NEW.status = 'refund' AND OLD.status != 'refund') THEN
        
        -- 1. Identify the Order and get the Item ID and amount
        -- We use the order_id from the transaction record
        SELECT item_id, total_amount INTO v_item_id, v_refund_amount_inr
        FROM public.orders
        WHERE id = NEW.order_id;

        -- 2. Update the Order status to match
        UPDATE public.orders
        SET payment_status = 'refunded'
        WHERE id = NEW.order_id;

        -- 3. Rollback the Wishlist Item
        IF v_item_id IS NOT NULL THEN
            UPDATE public.wishlist_items
            SET 
                -- Subtract the refunded INR amount
                amount_raised = GREATEST(amount_raised - v_refund_amount_inr, 0),
                -- Explicitly set back to 'available'
                status = 'available',
                -- Increment quantity by 1 instead of just setting to 1
                quantity = quantity + 1,
                updated_at = NOW()
            WHERE id = v_item_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."process_refund_rollback"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_item_raised_amount"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- When an order is paid, recalculate the sum for that item automatically
    IF (NEW.payment_status = 'paid') THEN
        UPDATE public.wishlist_items
        SET amount_raised = (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM public.orders
            WHERE item_id = NEW.item_id AND payment_status = 'paid'
        )
        WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_item_raised_amount"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_and_fix_ledger"() RETURNS TABLE("fixed_item_id" "uuid", "item_title" "text", "prev_amount" numeric, "new_amount" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH actual_sums AS (
        SELECT 
            COALESCE(item_id, wishlist_item_id) as linked_id, 
            SUM(total_amount) as true_total
        FROM public.orders
        WHERE payment_status = 'paid'
        GROUP BY 1
    )
    UPDATE public.wishlist_items w
    SET 
        amount_raised = s.true_total,
        -- Update status to claimed if goal met
        status = CASE WHEN s.true_total >= w.price THEN 'claimed' ELSE 'available' END,
        updated_at = NOW()
    FROM actual_sums s
    WHERE w.id = s.linked_id
    AND w.amount_raised != s.true_total
    RETURNING w.id, w.title, w.amount_raised - s.true_total + s.true_total, w.amount_raised;
END;
$$;


ALTER FUNCTION "public"."validate_and_fix_ledger"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "wishlist_item_id" "uuid",
    "buyer_email" "text",
    "payment_status" "text",
    "gift_status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "razorpay_payment_id" "text",
    "total_amount" numeric,
    "buyer_name" "text",
    "items" "jsonb",
    "creator_id" "uuid",
    "admin_notes" "text",
    "currency_code" "text" DEFAULT 'INR'::"text",
    "subtotal" numeric(10,2) DEFAULT 0,
    "platform_fee" numeric(10,2) DEFAULT 0,
    "estimated_tax" numeric(10,2) DEFAULT 0,
    "actual_shipping_paid" numeric(10,2) DEFAULT 0,
    "actual_purchase_cost" numeric(10,2),
    "tracking_number" "text",
    "exchange_rate_at_payment" numeric(10,4),
    "invoice_url" "text",
    "is_crowdfund" boolean DEFAULT false,
    "item_id" "uuid",
    "carrier_name" "text",
    "is_crowdfund_master" boolean DEFAULT false,
    "buyer_message" "text",
    "is_surprise" boolean DEFAULT false,
    "surprise_amount_in_inr" numeric DEFAULT 0,
    "buyer_anonymous" boolean,
    CONSTRAINT "check_gift_status" CHECK (("gift_status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text", 'processing'::"text", 'shipped'::"text", 'delivered'::"text"])))
);

ALTER TABLE ONLY "public"."orders" REPLICA IDENTITY FULL;


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."orders"."subtotal" IS 'The actual price of the gift items';



COMMENT ON COLUMN "public"."orders"."platform_fee" IS 'Processing and platform charges paid by the fan';



CREATE OR REPLACE VIEW "public"."admin_fulfillment_tasks" WITH ("security_invoker"='on') AS
 SELECT "id",
    "buyer_name",
    (("items" -> 0) ->> 'title'::"text") AS "product_name",
    "total_amount",
    "gift_status",
    "created_at"
   FROM "public"."orders"
  WHERE ("gift_status" = 'accepted'::"text");


ALTER VIEW "public"."admin_fulfillment_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text",
    "wishlist_item_id" "uuid",
    "title" "text" NOT NULL,
    "image_url" "text",
    "price" numeric,
    "store" "text",
    "product_url" "text" NOT NULL,
    "quantity" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "recipient_id" "uuid",
    "is_contribution" boolean DEFAULT false,
    "unit_price" numeric
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."creator_profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "display_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "address_line1" "text",
    "address_line2" "text",
    "city" "text",
    "state" "text",
    "country" "text",
    "full_name" "text",
    "postal_code" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "username" "text",
    "bio" character varying,
    "avatar_url" "text",
    "banner_url" "text",
    "country_code" "text" DEFAULT 'IN'::"text",
    "currency" "text" DEFAULT 'INR'::"text",
    "shipping_address" "text",
    "withdrawable_balance" numeric DEFAULT 0,
    "bank_linked" boolean DEFAULT false,
    "payout_destination_id" "text",
    "payout_details" "jsonb",
    "phone" "text",
    "social_links" "jsonb" DEFAULT '{}'::"jsonb",
    "is_profile_claimed" boolean DEFAULT false,
    "is_founding_member" boolean DEFAULT false,
    "is_verified" boolean DEFAULT false
);


ALTER TABLE "public"."creator_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."global_settings" (
    "id" "text" DEFAULT 'current_rates'::"text" NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "rates" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."global_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wishlist_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "creator_id" "uuid",
    "url" "text" NOT NULL,
    "title" "text" NOT NULL,
    "price" numeric,
    "original_price" "text",
    "discount" "text",
    "image" "text",
    "brand" "text",
    "store" "text",
    "category" "text",
    "variants" "jsonb" DEFAULT '{}'::"jsonb",
    "custom_options" "jsonb" DEFAULT '[]'::"jsonb",
    "specifications" "jsonb" DEFAULT '[]'::"jsonb",
    "rating" numeric,
    "reviews" integer,
    "availability" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "currency_code" "text" DEFAULT 'INR'::"text",
    "selected_size" "text",
    "selected_color" "text",
    "notes" "text",
    "quantity" integer DEFAULT 1,
    "is_crowdfund" boolean DEFAULT false,
    "amount_raised" numeric DEFAULT 0,
    "status" "text" DEFAULT 'available'::"text",
    "priority_level" integer DEFAULT 3,
    "is_general_fund" boolean DEFAULT false,
    "image_url" "text",
    CONSTRAINT "check_priority" CHECK (("priority_level" = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT "price_not_exceeded" CHECK (("amount_raised" <= "price"))
);


ALTER TABLE "public"."wishlist_items" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."ledger_discrepancies" WITH ("security_invoker"='on') AS
 SELECT "w"."id",
    "w"."title",
    "w"."amount_raised" AS "reported_amount",
    COALESCE("sum"("o"."total_amount"), (0)::numeric) AS "actual_amount",
    ("w"."amount_raised" - COALESCE("sum"("o"."total_amount"), (0)::numeric)) AS "difference"
   FROM ("public"."wishlist_items" "w"
     LEFT JOIN "public"."orders" "o" ON (((("w"."id" = "o"."item_id") OR ("w"."id" = "o"."wishlist_item_id")) AND ("o"."payment_status" = 'paid'::"text"))))
  GROUP BY "w"."id", "w"."title", "w"."amount_raised"
 HAVING ("w"."amount_raised" <> COALESCE("sum"("o"."total_amount"), (0)::numeric));


ALTER VIEW "public"."ledger_discrepancies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_session_id" "text",
    "event_type" "text",
    "username_viewed" "text",
    "metadata" "jsonb",
    "user_agent" "text"
);


ALTER TABLE "public"."session_logs" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."top_closers" WITH ("security_invoker"='on') AS
 SELECT "id",
    "title",
    "price",
    "amount_raised",
    (("amount_raised" / "price") * (100)::numeric) AS "percent_complete"
   FROM "public"."wishlist_items"
  WHERE (("is_crowdfund" = true) AND ("status" = 'active'::"text") AND ("amount_raised" < "price"))
  ORDER BY (("amount_raised" / "price") * (100)::numeric) DESC;


ALTER VIEW "public"."top_closers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "creator_id" "uuid",
    "amount_inr" numeric NOT NULL,
    "currency_code" "text" DEFAULT 'INR'::"text",
    "type" "text",
    "status" "text" DEFAULT 'success'::"text",
    "provider_payment_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "currency_rate" numeric,
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['gift_payment'::"text", 'payout'::"text", 'refund'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."transactions"."currency_rate" IS 'exchange rate';



CREATE TABLE IF NOT EXISTS "public"."wishlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "creator_id" "uuid",
    "title" "text",
    "is_public" boolean DEFAULT true
);


ALTER TABLE "public"."wishlists" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."creator_profiles"
    ADD CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."creator_profiles"
    ADD CONSTRAINT "creator_profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."global_settings"
    ADD CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_logs"
    ADD CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."creator_profiles"
    ADD CONSTRAINT "unique_username" UNIQUE ("username");



ALTER TABLE ONLY "public"."wishlist_items"
    ADD CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_creator_username" ON "public"."creator_profiles" USING "btree" ("username");



CREATE INDEX "idx_wishlist_category" ON "public"."wishlist_items" USING "btree" ("category");



CREATE INDEX "idx_wishlist_created" ON "public"."wishlist_items" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_wishlist_creator" ON "public"."wishlist_items" USING "btree" ("creator_id");



CREATE OR REPLACE TRIGGER "notifications" AFTER INSERT OR UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://ogarisvzvwajgzlaoami.supabase.co/functions/v1/notifications', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nYXJpc3Z6dndhamd6bGFvYW1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE5MDEyNSwiZXhwIjoyMDgzNzY2MTI1fQ.bVaLjLDvzpySovo4omncV97lFarSamrldBMtoUoNRGw"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "on_order_rejected" AFTER UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."handle_rejected_order"();



CREATE OR REPLACE TRIGGER "on_transaction_status_change" AFTER UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_transaction_refund"();



CREATE OR REPLACE TRIGGER "trigger_on_refund_success" AFTER UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."process_refund_rollback"();



CREATE OR REPLACE TRIGGER "update_wishlist_items_updated_at" BEFORE UPDATE ON "public"."wishlist_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_wishlist_item_id_fkey" FOREIGN KEY ("wishlist_item_id") REFERENCES "public"."wishlist_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "fk_item" FOREIGN KEY ("item_id") REFERENCES "public"."wishlist_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."wishlist_items"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."wishlist_items"
    ADD CONSTRAINT "wishlist_items_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON UPDATE CASCADE;



CREATE POLICY "Admin full access" ON "public"."orders" TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = 'your-email@gmail.com'::"text"));



CREATE POLICY "Allow anonymous inserts" ON "public"."cart_items" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anonymous inserts" ON "public"."orders" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anonymous inserts" ON "public"."session_logs" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow anonymous select" ON "public"."cart_items" FOR SELECT USING (true);



CREATE POLICY "Allow anyone to update item status" ON "public"."wishlist_items" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow anyone to view order status by ID" ON "public"."orders" FOR SELECT USING (true);



CREATE POLICY "Allow authenticated insert" ON "public"."cart_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated select" ON "public"."cart_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow claiming of reserved profiles" ON "public"."creator_profiles" FOR UPDATE TO "authenticated" USING (("is_profile_claimed" = false)) WITH CHECK (true);



CREATE POLICY "Allow public read access" ON "public"."wishlist_items" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to global_settings" ON "public"."global_settings" FOR SELECT USING (true);



CREATE POLICY "Allow public select" ON "public"."orders" FOR SELECT USING (true);



CREATE POLICY "Allow public to insert orders" ON "public"."orders" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public to view orders by ID" ON "public"."orders" FOR SELECT USING (true);



CREATE POLICY "Allow signup profile creation" ON "public"."creator_profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Creator can manage own wishlists" ON "public"."wishlists" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "Creator can view own wishlists" ON "public"."wishlists" FOR SELECT USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Creators can see their own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Creators can update their own gift status" ON "public"."orders" FOR UPDATE USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "Creators can view their own profile logs" ON "public"."session_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."creator_profiles"
  WHERE (("creator_profiles"."username" = "session_logs"."username_viewed") AND ("creator_profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Creators can view their own transactions" ON "public"."transactions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Enable delete for all users" ON "public"."cart_items" FOR DELETE USING (true);



CREATE POLICY "Enable delete for anyone with item ID" ON "public"."wishlist_items" FOR DELETE USING (true);



CREATE POLICY "Enable insert for all users" ON "public"."cart_items" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for anonymous users" ON "public"."transactions" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Enable select for all users" ON "public"."cart_items" FOR SELECT USING (true);



CREATE POLICY "Profiles are viewable by everyone" ON "public"."creator_profiles" FOR SELECT USING (true);



CREATE POLICY "Public can view public wishlists" ON "public"."wishlists" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."creator_profiles" FOR SELECT USING (true);



CREATE POLICY "Users can delete own items" ON "public"."wishlist_items" FOR DELETE USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can insert own items" ON "public"."wishlist_items" FOR INSERT WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can update own items" ON "public"."wishlist_items" FOR UPDATE USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can update own profile" ON "public"."creator_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own items" ON "public"."wishlist_items" FOR UPDATE USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can update their own profile" ON "public"."creator_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can upsert own profile" ON "public"."creator_profiles" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."creator_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own wishlist" ON "public"."wishlist_items" FOR SELECT USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can view unclaimed profiles" ON "public"."creator_profiles" FOR SELECT USING (("is_profile_claimed" = false));



CREATE POLICY "Wishlist items are viewable by everyone" ON "public"."wishlist_items" FOR SELECT USING (true);



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."creator_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."global_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert own profile" ON "public"."creator_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read own profile" ON "public"."creator_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."session_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update own profile" ON "public"."creator_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."wishlist_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wishlists" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."orders";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."auto_finalize_crowdfund"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_finalize_crowdfund"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_finalize_crowdfund"() TO "service_role";



GRANT ALL ON FUNCTION "public"."contribute_to_crowdfund"("item_id" "uuid", "amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."contribute_to_crowdfund"("item_id" "uuid", "amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."contribute_to_crowdfund"("item_id" "uuid", "amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_item_quantity"("row_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_item_quantity"("row_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_item_quantity"("row_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_item_raised"("row_id" "uuid", "amount_to_subtract" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_item_raised"("row_id" "uuid", "amount_to_subtract" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_item_raised"("row_id" "uuid", "amount_to_subtract" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_account"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_full_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_full_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_full_account"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_rejected_order"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_rejected_order"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_rejected_order"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_transaction_refund"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_transaction_refund"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_transaction_refund"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_creator_balance"("user_id" "uuid", "amount_to_add" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_creator_balance"("user_id" "uuid", "amount_to_add" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_creator_balance"("user_id" "uuid", "amount_to_add" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_item_raised"("row_id" "uuid", "amount_to_add" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_item_raised"("row_id" "uuid", "amount_to_add" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_item_raised"("row_id" "uuid", "amount_to_add" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_wishlist_raised"("row_id" "uuid", "increment_by" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."process_refund_rollback"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_refund_rollback"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_refund_rollback"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_item_raised_amount"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_item_raised_amount"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_item_raised_amount"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_and_fix_ledger"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_and_fix_ledger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_and_fix_ledger"() TO "service_role";
























GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."admin_fulfillment_tasks" TO "anon";
GRANT ALL ON TABLE "public"."admin_fulfillment_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_fulfillment_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."creator_profiles" TO "anon";
GRANT ALL ON TABLE "public"."creator_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."creator_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."global_settings" TO "anon";
GRANT ALL ON TABLE "public"."global_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."global_settings" TO "service_role";



GRANT ALL ON TABLE "public"."wishlist_items" TO "anon";
GRANT ALL ON TABLE "public"."wishlist_items" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlist_items" TO "service_role";



GRANT ALL ON TABLE "public"."ledger_discrepancies" TO "anon";
GRANT ALL ON TABLE "public"."ledger_discrepancies" TO "authenticated";
GRANT ALL ON TABLE "public"."ledger_discrepancies" TO "service_role";



GRANT ALL ON TABLE "public"."session_logs" TO "anon";
GRANT ALL ON TABLE "public"."session_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."session_logs" TO "service_role";



GRANT ALL ON TABLE "public"."top_closers" TO "anon";
GRANT ALL ON TABLE "public"."top_closers" TO "authenticated";
GRANT ALL ON TABLE "public"."top_closers" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."wishlists" TO "anon";
GRANT ALL ON TABLE "public"."wishlists" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlists" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

create extension if not exists "pg_net" with schema "public";


  create policy "Allow Authenticated Upload 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'avatars'::text));



  create policy "Allow Public View 10abb02_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'item-images'::text));



  create policy "Allow Public View 10abb02_1"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'item-images'::text));



  create policy "Allow Public View 10abb02_2"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'item-images'::text));



  create policy "Allow Public View 10abb02_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'item-images'::text));



  create policy "Allow Public View 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (true);



  create policy "Allow User Update/Delete 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Allow User Update/Delete 1oj01fe_1"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Allow User Update/Delete 1oj01fe_2"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Allow admin uploads 1r7knet_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'order-invoices'::text));



  create policy "Authors can update/delete own banners 1tghu4n_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'banners'::text));



  create policy "Authors can update/delete own banners 1tghu4n_2"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'banners'::text));



  create policy "Authors can upload banners 1tghu4n_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'banners'::text));



