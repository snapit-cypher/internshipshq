// ============================================================== //
// ============================================================== //
// ====================== Ghost Blog API ======================= //
// ============================================================== //
// ============================================================== //

export type PostT = {
	id: string;
	title: string;
	slug: string;
	html: string;
	excerpt: string;
	custom_excerpt?: string;
	feature_image?: string;
	featured: boolean;
	visibility: string;
	created_at: string;
	updated_at: string;
	published_at: string;
	meta_title?: string;
	meta_description?: string;
	tags: Array<{
		id: string;
		name: string;
		slug: string;
		description?: string;
		feature_image?: string;
		visibility: string;
		meta_title?: string;
		meta_description?: string;
		created_at: string;
		updated_at: string;
	}>;
	authors: Array<{
		id: string;
		name: string;
		slug: string;
		email: string;
		profile_image?: string;
		cover_image?: string;
		bio?: string;
		website?: string;
		location?: string;
		facebook?: string;
		twitter?: string;
		created_at: string;
		updated_at: string;
	}>;
	primary_tag?: {
		id: string;
		name: string;
		slug: string;
		description?: string;
		feature_image?: string;
		visibility: string;
		meta_title?: string;
		meta_description?: string;
		created_at: string;
		updated_at: string;
	};
	primary_author?: {
		id: string;
		name: string;
		slug: string;
		email: string;
		profile_image?: string;
		cover_image?: string;
		bio?: string;
		website?: string;
		location?: string;
		facebook?: string;
		twitter?: string;
		created_at: string;
		updated_at: string;
	};
};

export type BlogPaginationT = {
	limit: number;
	next: number | null;
	page: number;
	pages: number;
	prev: number | null;
	total: number;
};

export type BlogPostsResponseT = {
	posts: PostT[];
	pagination: BlogPaginationT;
};

// ============================================================== //
// ============================================================== //
// ====================== RapidAPI API Types ==================== //
// ============================================================== //
// ============================================================== //

export interface RapidAPIJobI {
	id: string;
	date_posted: string;
	date_created: string | null;
	title: string;
	organization: string;
	organization_url: string | null;
	date_validthrough: string | null;
	url: string;
	source_type: string | null;
	source: string | null;
	source_domain: string | null;
	organization_logo: string | null;
	domain_derived: string | null;

	locations_raw: Array<{
		address: {
			streetAddress?: string;
			addressLocality?: string;
			addressRegion?: string;
			postalCode?: string;
			addressCountry?: string;
		};
	}> | null;
	locations_alt_raw: string[] | null;
	location_type: string | null;
	location_requirements_raw: string | null;
	cities_derived: string[] | null;
	counties_derived: string[] | null;
	regions_derived: string[] | null;
	countries_derived: string[] | null;
	locations_derived: string[] | null;
	timezones_derived: string[] | null;
	lats_derived: number[] | null;
	lngs_derived: number[] | null;
	remote_derived: boolean;

	description_html: string;
	description_text?: string | null;

	employment_type: string[] | null;
	salary_raw: string | null;

	ai_salary_currency: string | null;
	ai_salary_value: number | null;
	ai_salary_minvalue: number | null;
	ai_salary_maxvalue: number | null;
	ai_salary_unittext: string | null;
	ai_benefits: string[] | null;
	ai_experience_level: string | null;
	ai_work_arrangement: string | null;
	ai_work_arrangement_office_days: number | null;
	ai_remote_location: string | null;
	ai_remote_location_derived: string | null;
	ai_key_skills: string[] | null;
	ai_hiring_manager_name: string | null;
	ai_hiring_manager_email_address: string | null;
	ai_core_responsibilities: string | null;
	ai_requirements_summary: string | null;
	ai_working_hours: number | null;
	ai_employment_type: string[] | null;
	ai_job_language: string | null;
	ai_visa_sponsorship: boolean;
	ai_keywords: string[] | null;
	ai_taxonomies_a: string[] | null;
	ai_education_requirements: string[] | null;

	linkedin_org_employees: number | null;
	linkedin_org_url: string | null;
	linkedin_org_size: string | null;
	linkedin_org_slogan: string | null;
	linkedin_org_industry: string | null;
	linkedin_org_followers: number | null;
	linkedin_org_headquarters: string | null;
	linkedin_org_type: string | null;
	linkedin_org_foundeddate: string | null;
	linkedin_org_specialties: string[] | null;
	linkedin_org_locations: string[] | null;
	linkedin_org_description: string | null;
	linkedin_org_slug: string | null;
}

export interface RapidAPIRateLimitHeadersI {
	jobsLimit: number;
	jobsRemaining: number;
	requestsLimit: number;
	requestsRemaining: number;
	resetTime: number;
}

export interface RapidAPIResponseWithHeadersI<T> {
	data: T;
	rateLimit: RapidAPIRateLimitHeadersI;
}

export interface FetchJobsOptionsI {
	limit?: number;
	offset?: number;
	title_filter?: string;
	location_filter?: string;
	include_ai?: boolean;
	include_li?: boolean;
	source?: string;
	description_type?: "html" | "text";
	targetJobs?: number;
	ai_employment_type_filter?: string;
}

export interface RapidAPIErrorI {
	message: string;
	statusCode: number;
	endpoint: string;
}

export interface BudgetStatusI {
	requests: { used: number; limit: number; percentage: number };
	jobs: { used: number; limit: number; percentage: number };
}

export interface SyncResultI {
	success: boolean;
	processed: number;
	skipped: number;
	errors: Array<{ jobId: string; error: string }>;
	apiUsage: {
		requests: number;
		jobs: number;
	};
	budgetStatus: BudgetStatusI;
	responseTime: number;
}

// ============================================================== //
// ============================================================== //
// ==================== Job Listing & Filters ================== //
// ============================================================== //
// ============================================================== //

export interface JobFiltersI {
	remote?: boolean;
	location?: string;
	experienceLevel?: string;
	categories?: string[];
	employmentType?: string;
	searchQuery?: string;
}

export interface JobListingInputI {
	page: number;
	limit: number;
	filters?: JobFiltersI;
}

export interface JobListingOutputI {
	jobs: Array<Record<string, unknown>>;
	total: number;
	page: number;
	totalPages: number;
}

// ============================================================== //
// ============================================================== //
// ==================== JOB TYPE ================================ //
// ============================================================== //
// ============================================================== //

export interface JobCardI {
	id: string;
	title: string;
	organization: string;
	datePosted: Date;
	citiesDerived?: string[] | null;
	countriesDerived?: string[] | null;
	remoteDerived: boolean;
	aiExperienceLevel: string | null;
	employmentType: string[] | null;
	aiSalaryMinvalue: number | null;
	aiSalaryMaxvalue: number | null;
	aiSalaryCurrency: string | null;
	aiTaxonomiesA: string[] | null;
	aiWorkingHours: number | null;
	aiJobLanguage: string | null;
	aiVisaSponsorship: boolean;
	aiCoreResponsibilities: string | null;
	linkedinOrgEmployees: number | null;
}

export interface JobI {
	id: string;
	datePosted: Date;
	dateCreated: Date | null;
	title: string;
	organization: string;
	organizationUrl: string | null;
	dateValidthrough: Date | null;
	url: string;
	sourceType: string | null;
	source: string | null;
	sourceDomain: string | null;
	organizationLogo: string | null;
	domainDerived: string | null;

	locationsRaw: Array<{
		address: {
			streetAddress?: string;
			addressLocality?: string;
			addressRegion?: string;
			postalCode?: string;
			addressCountry?: string;
		};
	}> | null;

	locationsAltRaw: string[] | null;
	locationType: string | null;
	locationRequirementsRaw: string | null;

	citiesDerived: string[] | null;
	countiesDerived: string[] | null;
	regionsDerived: string[] | null;
	countriesDerived: string[] | null;
	locationsDerived: string[] | null;
	timezonesDerived: string[] | null;

	latsDerived: number[] | null;
	lngsDerived: number[] | null;
	remoteDerived: boolean;

	descriptionHtml: string | null;
	descriptionText: string | null;

	employmentType: string[] | null;
	salaryRaw: string | null;

	aiSalaryCurrency: string | null;
	aiSalaryValue: number | null;
	aiSalaryMinvalue: number | null;
	aiSalaryMaxvalue: number | null;
	aiSalaryUnittext: string | null;
	aiBenefits: string[] | null;
	aiExperienceLevel: string | null;
	aiWorkArrangement: string | null;
	aiWorkArrangementOfficeDays: number | null;
	aiRemoteLocation: string | null;
	aiRemoteLocationDerived: string | null;
	aiKeySkills: string[] | null;
	aiHiringManagerName: string | null;
	aiHiringManagerEmailAddress: string | null;
	aiCoreResponsibilities: string | null;
	aiRequirementsSummary: string | null;
	aiWorkingHours: number | null;
	aiEmploymentType: string[] | null;
	aiJobLanguage: string | null;
	aiVisaSponsorship: boolean;
	aiKeywords: string[] | null;
	aiTaxonomiesA: string[] | null;
	aiEducationRequirements: string[] | null;

	linkedinOrgEmployees: number | null;
	linkedinOrgUrl: string | null;
	linkedinOrgSize: string | null;
	linkedinOrgSlogan: string | null;
	linkedinOrgIndustry: string | null;
	linkedinOrgFollowers: number | null;
	linkedinOrgHeadquarters: string | null;
	linkedinOrgType: string | null;
	linkedinOrgFoundeddate: string | null;
	linkedinOrgSpecialties: string[] | null;
	linkedinOrgLocations: string[] | null;
	linkedinOrgDescription: string | null;
	linkedinOrgSlug: string | null;

	isExpired: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export type FaqContentBlock =
	| {
			type: "paragraph";
			text: string;
	  }
	| {
			type: "list";
			items: string[];
	  };

export type FaqItem = {
	question: string;
	content: FaqContentBlock[];
};

export type JobCategoryT = {
	category: string;
	count: number;
};
