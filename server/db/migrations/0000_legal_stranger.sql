CREATE TABLE "internshipshq_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "internshipshq_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "internshipshq_alert_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"keywords" jsonb,
	"locations" jsonb,
	"remote_only" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_alert_sent_at" timestamp with time zone,
	"alerts_sent_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internshipshq_api_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"jobs_limit" integer,
	"jobs_remaining" integer,
	"requests_limit" integer,
	"requests_remaining" integer,
	"billing_period_reset_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internshipshq_api_usage_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"endpoint" text NOT NULL,
	"jobs_fetched" integer DEFAULT 0 NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"response_time_ms" integer,
	"status" varchar(20) NOT NULL,
	"error_message" text,
	"billing_period_reset_at" timestamp with time zone,
	"jobs_limit" integer,
	"jobs_remaining" integer,
	"requests_limit" integer,
	"requests_remaining" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internshipshq_email_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"categories" jsonb,
	"is_subscribed" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"unsubscribe_token" text,
	"last_email_sent_at" timestamp with time zone,
	"emails_sent_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "internshipshq_email_subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "internshipshq_email_subscribers_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
CREATE TABLE "internshipshq_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"date_posted" timestamp with time zone NOT NULL,
	"date_created" timestamp with time zone,
	"title" text NOT NULL,
	"organization" text NOT NULL,
	"organization_url" text,
	"date_validthrough" timestamp with time zone,
	"url" text NOT NULL,
	"source_type" text,
	"source" text,
	"source_domain" text,
	"organization_logo" text,
	"domain_derived" text,
	"locations_raw" jsonb,
	"locations_alt_raw" jsonb,
	"location_type" text,
	"location_requirements_raw" text,
	"cities_derived" jsonb,
	"counties_derived" jsonb,
	"regions_derived" jsonb,
	"countries_derived" jsonb,
	"locations_derived" jsonb,
	"timezones_derived" jsonb,
	"lats_derived" jsonb,
	"lngs_derived" jsonb,
	"remote_derived" boolean DEFAULT false NOT NULL,
	"description_html" text,
	"description_text" text,
	"employment_type" jsonb,
	"salary_raw" text,
	"ai_salary_currency" varchar(10),
	"ai_salary_value" real,
	"ai_salary_minvalue" real,
	"ai_salary_maxvalue" real,
	"ai_salary_unittext" varchar(50),
	"ai_benefits" jsonb,
	"ai_experience_level" varchar(50),
	"ai_work_arrangement" varchar(100),
	"ai_work_arrangement_office_days" real,
	"ai_remote_location" text,
	"ai_remote_location_derived" text,
	"ai_key_skills" jsonb,
	"ai_hiring_manager_name" text,
	"ai_hiring_manager_email_address" text,
	"ai_core_responsibilities" text,
	"ai_requirements_summary" text,
	"ai_working_hours" real,
	"ai_employment_type" jsonb,
	"ai_job_language" varchar(100),
	"ai_visa_sponsorship" boolean DEFAULT false NOT NULL,
	"ai_keywords" jsonb,
	"ai_taxonomies_a" jsonb,
	"ai_education_requirements" jsonb,
	"linkedin_org_employees" integer,
	"linkedin_org_url" text,
	"linkedin_org_size" text,
	"linkedin_org_slogan" text,
	"linkedin_org_industry" text,
	"linkedin_org_followers" integer,
	"linkedin_org_headquarters" text,
	"linkedin_org_type" text,
	"linkedin_org_foundeddate" text,
	"linkedin_org_specialties" jsonb,
	"linkedin_org_locations" jsonb,
	"linkedin_org_description" text,
	"linkedin_org_slug" text,
	"is_expired" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"google_indexed" boolean DEFAULT false NOT NULL,
	"google_indexed_at" timestamp with time zone,
	"google_indexing_status" varchar(20),
	"google_indexing_error" text
);
--> statement-breakpoint
CREATE TABLE "internshipshq_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internshipshq_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" text,
	"password" varchar(255),
	CONSTRAINT "internshipshq_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "internshipshq_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "internshipshq_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "internshipshq_account" ADD CONSTRAINT "internshipshq_account_user_id_internshipshq_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."internshipshq_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internshipshq_alert_preferences" ADD CONSTRAINT "internshipshq_alert_preferences_user_id_internshipshq_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."internshipshq_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internshipshq_session" ADD CONSTRAINT "internshipshq_session_user_id_internshipshq_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."internshipshq_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "internshipshq_account_user_id_idx" ON "internshipshq_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "internshipshq_alert_preferences_user_id_idx" ON "internshipshq_alert_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "internshipshq_alert_preferences_is_active_idx" ON "internshipshq_alert_preferences" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "internshipshq_api_usage_logs_timestamp_idx" ON "internshipshq_api_usage_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "internshipshq_api_usage_logs_status_idx" ON "internshipshq_api_usage_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "internshipshq_api_usage_logs_billing_period_reset_at_idx" ON "internshipshq_api_usage_logs" USING btree ("billing_period_reset_at");--> statement-breakpoint
CREATE INDEX "internshipshq_email_subscribers_email_idx" ON "internshipshq_email_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "internshipshq_email_subscribers_is_subscribed_idx" ON "internshipshq_email_subscribers" USING btree ("is_subscribed");--> statement-breakpoint
CREATE INDEX "internshipshq_email_subscribers_unsubscribe_token_idx" ON "internshipshq_email_subscribers" USING btree ("unsubscribe_token");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_date_posted_idx" ON "internshipshq_jobs" USING btree ("date_posted");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_is_expired_idx" ON "internshipshq_jobs" USING btree ("is_expired");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_remote_derived_idx" ON "internshipshq_jobs" USING btree ("remote_derived");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_ai_experience_level_idx" ON "internshipshq_jobs" USING btree ("ai_experience_level");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_title_idx" ON "internshipshq_jobs" USING btree ("title");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_organization_idx" ON "internshipshq_jobs" USING btree ("organization");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_google_indexed_idx" ON "internshipshq_jobs" USING btree ("google_indexed");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_google_indexed_at_idx" ON "internshipshq_jobs" USING btree ("google_indexed_at");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_is_expired_google_indexed_idx" ON "internshipshq_jobs" USING btree ("is_expired","google_indexed");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_cities_derived_gin_idx" ON "internshipshq_jobs" USING gin ("cities_derived");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_regions_derived_gin_idx" ON "internshipshq_jobs" USING gin ("regions_derived");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_countries_derived_gin_idx" ON "internshipshq_jobs" USING gin ("countries_derived");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_ai_taxonomies_a_gin_idx" ON "internshipshq_jobs" USING gin ("ai_taxonomies_a");--> statement-breakpoint
CREATE INDEX "internshipshq_jobs_employment_type_gin_idx" ON "internshipshq_jobs" USING gin ("employment_type");--> statement-breakpoint
CREATE INDEX "internshipshq_session_user_id_idx" ON "internshipshq_session" USING btree ("user_id");