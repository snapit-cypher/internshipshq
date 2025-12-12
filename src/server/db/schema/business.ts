import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";
import { users } from "./users";

export const createTable = pgTableCreator((name) => `internshipshq_${name}`);

export const jobs = createTable(
	"jobs",
	(d) => ({
		id: d.text("id").notNull().primaryKey(),
		datePosted: d
			.timestamp("date_posted", { mode: "date", withTimezone: true })
			.notNull(),
		dateCreated: d.timestamp("date_created", {
			mode: "date",
			withTimezone: true,
		}),
		title: d.text("title").notNull(),
		organization: d.text("organization").notNull(),
		organizationUrl: d.text("organization_url"),
		dateValidthrough: d.timestamp("date_validthrough", {
			mode: "date",
			withTimezone: true,
		}),
		url: d.text("url").notNull(),
		sourceType: d.text("source_type"),
		source: d.text("source"),
		sourceDomain: d.text("source_domain"),
		organizationLogo: d.text("organization_logo"),
		domainDerived: d.text("domain_derived"),

		locationsRaw: d.jsonb("locations_raw").$type<
			Array<{
				address: {
					streetAddress?: string;
					addressLocality?: string;
					addressRegion?: string;
					postalCode?: string;
					addressCountry?: string;
				};
			}>
		>(),
		locationsAltRaw: d.jsonb("locations_alt_raw").$type<string[]>(),
		locationType: d.text("location_type"),
		locationRequirementsRaw: d.text("location_requirements_raw"),
		citiesDerived: d.jsonb("cities_derived").$type<string[]>(),
		countiesDerived: d.jsonb("counties_derived").$type<string[]>(),
		regionsDerived: d.jsonb("regions_derived").$type<string[]>(),
		countriesDerived: d.jsonb("countries_derived").$type<string[]>(),
		locationsDerived: d.jsonb("locations_derived").$type<string[]>(),
		timezonesDerived: d.jsonb("timezones_derived").$type<string[]>(),
		latsDerived: d.jsonb("lats_derived").$type<number[]>(),
		lngsDerived: d.jsonb("lngs_derived").$type<number[]>(),
		remoteDerived: d.boolean("remote_derived").notNull().default(false),

		descriptionHtml: d.text("description_html"),
		descriptionText: d.text("description_text"),

		employmentType: d.jsonb("employment_type").$type<string[]>(),
		salaryRaw: d.text("salary_raw"),

		aiSalaryCurrency: d.varchar("ai_salary_currency", { length: 10 }),
		aiSalaryValue: d.real("ai_salary_value"),
		aiSalaryMinvalue: d.real("ai_salary_minvalue"),
		aiSalaryMaxvalue: d.real("ai_salary_maxvalue"),
		aiSalaryUnittext: d.varchar("ai_salary_unittext", { length: 50 }),
		aiBenefits: d.jsonb("ai_benefits").$type<string[]>(),
		aiExperienceLevel: d.varchar("ai_experience_level", { length: 50 }),
		aiWorkArrangement: d.varchar("ai_work_arrangement", { length: 100 }),
		aiWorkArrangementOfficeDays: d.real("ai_work_arrangement_office_days"),
		aiRemoteLocation: d.text("ai_remote_location"),
		aiRemoteLocationDerived: d.text("ai_remote_location_derived"),
		aiKeySkills: d.jsonb("ai_key_skills").$type<string[]>(),
		aiHiringManagerName: d.text("ai_hiring_manager_name"),
		aiHiringManagerEmailAddress: d.text("ai_hiring_manager_email_address"),
		aiCoreResponsibilities: d.text("ai_core_responsibilities"),
		aiRequirementsSummary: d.text("ai_requirements_summary"),
		aiWorkingHours: d.real("ai_working_hours"),
		aiEmploymentType: d.jsonb("ai_employment_type").$type<string[]>(),
		aiJobLanguage: d.varchar("ai_job_language", { length: 100 }),
		aiVisaSponsorship: d
			.boolean("ai_visa_sponsorship")
			.notNull()
			.default(false),
		aiKeywords: d.jsonb("ai_keywords").$type<string[]>(),
		aiTaxonomiesA: d.jsonb("ai_taxonomies_a").$type<string[]>(),
		aiEducationRequirements: d
			.jsonb("ai_education_requirements")
			.$type<string[]>(),

		linkedinOrgEmployees: d.integer("linkedin_org_employees"),
		linkedinOrgUrl: d.text("linkedin_org_url"),
		linkedinOrgSize: d.text("linkedin_org_size"),
		linkedinOrgSlogan: d.text("linkedin_org_slogan"),
		linkedinOrgIndustry: d.text("linkedin_org_industry"),
		linkedinOrgFollowers: d.integer("linkedin_org_followers"),
		linkedinOrgHeadquarters: d.text("linkedin_org_headquarters"),
		linkedinOrgType: d.text("linkedin_org_type"),
		linkedinOrgFoundeddate: d.text("linkedin_org_foundeddate"),
		linkedinOrgSpecialties: d
			.jsonb("linkedin_org_specialties")
			.$type<string[]>(),
		linkedinOrgLocations: d.jsonb("linkedin_org_locations").$type<string[]>(),
		linkedinOrgDescription: d.text("linkedin_org_description"),
		linkedinOrgSlug: d.text("linkedin_org_slug"),

		isExpired: d.boolean("is_expired").notNull().default(false),
		createdAt: d
			.timestamp("created_at", { mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at", { mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),

		googleIndexed: d.boolean("google_indexed").notNull().default(false),
		googleIndexedAt: d.timestamp("google_indexed_at", {
			mode: "date",
			withTimezone: true,
		}),
		googleIndexingStatus: d.varchar("google_indexing_status", { length: 20 }),
		googleIndexingError: d.text("google_indexing_error"),
	}),
	(t) => [
		index("internshipshq_jobs_date_posted_idx").on(t.datePosted),
		index("internshipshq_jobs_is_expired_idx").on(t.isExpired),
		index("internshipshq_jobs_remote_derived_idx").on(t.remoteDerived),
		index("internshipshq_jobs_ai_experience_level_idx").on(t.aiExperienceLevel),
		index("internshipshq_jobs_title_idx").on(t.title),
		index("internshipshq_jobs_organization_idx").on(t.organization),
		// Google indexing indexes
		index("internshipshq_jobs_google_indexed_idx").on(t.googleIndexed),
		index("internshipshq_jobs_google_indexed_at_idx").on(t.googleIndexedAt),
		index("internshipshq_jobs_is_expired_google_indexed_idx").on(
			t.isExpired,
			t.googleIndexed,
		),
		// GIN indexes for JSONB array columns
		index("internshipshq_jobs_cities_derived_gin_idx").using(
			"gin",
			sql`${t.citiesDerived}`,
		),
		index("internshipshq_jobs_regions_derived_gin_idx").using(
			"gin",
			sql`${t.regionsDerived}`,
		),
		index("internshipshq_jobs_countries_derived_gin_idx").using(
			"gin",
			sql`${t.countriesDerived}`,
		),
		index("internshipshq_jobs_ai_taxonomies_a_gin_idx").using(
			"gin",
			sql`${t.aiTaxonomiesA}`,
		),
		index("internshipshq_jobs_employment_type_gin_idx").using(
			"gin",
			sql`${t.employmentType}`,
		),
	],
);

export const apiConfig = createTable("api_config", (d) => ({
	id: d.serial("id").notNull().primaryKey(),
	jobsLimit: d.integer("jobs_limit"),
	jobsRemaining: d.integer("jobs_remaining"),
	requestsLimit: d.integer("requests_limit"),
	requestsRemaining: d.integer("requests_remaining"),
	billingPeriodResetAt: d.timestamp("billing_period_reset_at", {
		mode: "date",
		withTimezone: true,
	}),
	updatedAt: d
		.timestamp("updated_at", { mode: "date", withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}));

export const apiUsageLogs = createTable(
	"api_usage_logs",
	(d) => ({
		id: d.serial("id").notNull().primaryKey(),
		timestamp: d
			.timestamp("timestamp", { mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		endpoint: d.text("endpoint").notNull(),
		jobsFetched: d.integer("jobs_fetched").notNull().default(0),
		requestCount: d.integer("request_count").notNull().default(1),
		responseTimeMs: d.integer("response_time_ms"),
		status: d.varchar("status", { length: 20 }).notNull(),
		errorMessage: d.text("error_message"),
		billingPeriodResetAt: d.timestamp("billing_period_reset_at", {
			mode: "date",
			withTimezone: true,
		}),
		jobsLimit: d.integer("jobs_limit"),
		jobsRemaining: d.integer("jobs_remaining"),
		requestsLimit: d.integer("requests_limit"),
		requestsRemaining: d.integer("requests_remaining"),
		createdAt: d
			.timestamp("created_at", { mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("internshipshq_api_usage_logs_timestamp_idx").on(t.timestamp),
		index("internshipshq_api_usage_logs_status_idx").on(t.status),
		index("internshipshq_api_usage_logs_billing_period_reset_at_idx").on(
			t.billingPeriodResetAt,
		),
	],
);

export const emailSubscribers = createTable(
	"email_subscribers",
	(d) => ({
		id: d.serial("id").notNull().primaryKey(),
		email: d.text("email").notNull().unique(),
		categories: d.jsonb("categories").$type<string[]>(),
		isSubscribed: d.boolean("is_subscribed").notNull().default(true),
		subscribedAt: d
			.timestamp("subscribed_at", { mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		unsubscribedAt: d.timestamp("unsubscribed_at", {
			mode: "date",
			withTimezone: true,
		}),
		unsubscribeToken: d.text("unsubscribe_token").unique(),
		lastEmailSentAt: d.timestamp("last_email_sent_at", {
			mode: "date",
			withTimezone: true,
		}),
		emailsSentCount: d.integer("emails_sent_count").notNull().default(0),
		createdAt: d
			.timestamp("created_at", { mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at", { mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("internshipshq_email_subscribers_email_idx").on(t.email),
		index("internshipshq_email_subscribers_is_subscribed_idx").on(
			t.isSubscribed,
		),
		index("internshipshq_email_subscribers_unsubscribe_token_idx").on(
			t.unsubscribeToken,
		),
	],
);

export const alertPreferences = createTable(
	"alert_preferences",
	(d) => ({
		id: d.serial("id").notNull().primaryKey(),
		userId: d
			.varchar("user_id", { length: 255 })
			.notNull()
			.references(() => users.id),
		name: d.text("name").notNull(),
		keywords: d.jsonb("keywords").$type<string[]>(),
		locations: d.jsonb("locations").$type<string[]>(),
		remoteOnly: d.boolean("remote_only").notNull().default(false),
		isActive: d.boolean("is_active").notNull().default(true),
		lastAlertSentAt: d.timestamp("last_alert_sent_at", {
			mode: "date",
			withTimezone: true,
		}),
		alertsSentCount: d.integer("alerts_sent_count").notNull().default(0),
		createdAt: d
			.timestamp("created_at", { mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d
			.timestamp("updated_at", { mode: "date", withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("internshipshq_alert_preferences_user_id_idx").on(t.userId),
		index("internshipshq_alert_preferences_is_active_idx").on(t.isActive),
	],
);

export const alertPreferencesRelations = relations(
	alertPreferences,
	({ one }) => ({
		user: one(users, {
			fields: [alertPreferences.userId],
			references: [users.id],
		}),
	}),
);
