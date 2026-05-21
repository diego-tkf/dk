CREATE TYPE "public"."actor_type" AS ENUM('user', 'agent', 'system');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'in_progress', 'in_review', 'approved', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."campaign_type" AS ENUM('weekly-carousel', 'newsletter', 'ad-variant');--> statement-breakpoint
CREATE TYPE "public"."compliance_status" AS ENUM('pending', 'passed', 'flagged', 'overridden', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."constraint_check" AS ENUM('vision_model', 'text_classifier', 'text_presence');--> statement-breakpoint
CREATE TYPE "public"."constraint_severity" AS ENUM('blocking', 'warning', 'info');--> statement-breakpoint
CREATE TYPE "public"."decision_action" AS ENUM('approve', 'reject', 'override');--> statement-breakpoint
CREATE TYPE "public"."decision_subject" AS ENUM('variant', 'deliverable', 'compliance_check', 'profile');--> statement-breakpoint
CREATE TYPE "public"."deliverable_status" AS ENUM('pending_generation', 'variants_ready', 'approved', 'exported', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."image_generator" AS ENUM('gpt-image-1', 'flux-1.1-pro');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('draft', 'in_review', 'approved', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."role_name" AS ENUM('designer', 'compliance_reviewer', 'profile_approver', 'admin', 'viewer');--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" text NOT NULL,
	"brand_id" text NOT NULL,
	"market" text NOT NULL,
	"language" text NOT NULL,
	"campaign_type" "campaign_type" NOT NULL,
	"applicable_profile_pins" jsonb NOT NULL,
	"status" "campaign_status" NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"profile_id" text NOT NULL,
	"profile_version" integer NOT NULL,
	"rule" text NOT NULL,
	"check_type" "constraint_check" NOT NULL,
	"passed" boolean NOT NULL,
	"evidence" text,
	"overridden" boolean DEFAULT false NOT NULL,
	"overridden_by" text,
	"override_reason" text,
	"overridden_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_profiles" (
	"id" text NOT NULL,
	"version" integer NOT NULL,
	"client_id" text,
	"market" text,
	"campaign_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"jurisdiction_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"constraints" jsonb NOT NULL,
	"legal_source_documents" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "profile_status" NOT NULL,
	"created_by" text NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"effective_date" timestamp with time zone NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "compliance_profiles_id_version_pk" PRIMARY KEY("id","version")
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" "decision_subject" NOT NULL,
	"subject_id" text NOT NULL,
	"action" "decision_action" NOT NULL,
	"actor_user_id" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"status" "deliverable_status" NOT NULL,
	"variant_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"approved_variant_id" uuid,
	"decisions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"actor" jsonb NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"entity_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"causation_id" uuid,
	"correlation_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"content_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"previous_event_hash" text
);
--> statement-breakpoint
CREATE TABLE "generated_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generator" "image_generator" NOT NULL,
	"model_version" text NOT NULL,
	"parameters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"prompt_id" uuid NOT NULL,
	"content_hash" text NOT NULL,
	"content_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_texts_hash" text NOT NULL,
	"derived_prompt" text NOT NULL,
	"model" text NOT NULL,
	"model_version" text NOT NULL,
	"parameters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"memory_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"profile_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"role" "role_name" DEFAULT 'viewer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "user_profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deliverable_id" uuid NOT NULL,
	"prompt_id" uuid NOT NULL,
	"image_content_hash" text NOT NULL,
	"composed_image_hashes" jsonb NOT NULL,
	"compliance_status" "compliance_status" NOT NULL,
	"compliance_check_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_deliverable_id_deliverables_id_fk" FOREIGN KEY ("deliverable_id") REFERENCES "public"."deliverables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_correlation_id_idx" ON "events" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "events_causation_id_idx" ON "events" USING btree ("causation_id");--> statement-breakpoint
CREATE INDEX "events_event_type_idx" ON "events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "events_timestamp_idx" ON "events" USING btree ("timestamp");