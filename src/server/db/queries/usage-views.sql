-- ============================================================================
-- Database Views for API Usage Tracking and Job Statistics
-- ============================================================================
-- These views provide quick access to API usage metrics and job statistics
-- without needing to create API endpoints. Query directly from your database
-- manager for monitoring and investigation.
-- ============================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS api_usage_monthly;
DROP VIEW IF EXISTS api_usage_daily;
DROP VIEW IF EXISTS job_stats_daily;
DROP VIEW IF EXISTS job_stats_by_source;
DROP VIEW IF EXISTS budget_status_current;

-- ============================================================================
-- View: api_usage_monthly
-- Purpose: Monthly API usage aggregated by month
-- Usage: SELECT * FROM api_usage_monthly ORDER BY month DESC LIMIT 12;
-- ============================================================================
CREATE VIEW api_usage_monthly AS
SELECT 
    DATE_TRUNC('month', timestamp) as month,
    SUM(jobs_fetched) as total_jobs,
    SUM(request_count) as total_requests,
    AVG(response_time_ms) as avg_response_time_ms,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
    ROUND(
        (COUNT(CASE WHEN status = 'success' THEN 1 END)::numeric / 
         NULLIF(COUNT(*)::numeric, 0) * 100), 2
    ) as success_rate_percentage
FROM dayonejobs_api_usage_logs
GROUP BY DATE_TRUNC('month', timestamp)
ORDER BY month DESC;

-- ============================================================================
-- View: api_usage_daily
-- Purpose: Daily API usage for the current month
-- Usage: SELECT * FROM api_usage_daily ORDER BY day DESC;
-- ============================================================================
CREATE VIEW api_usage_daily AS
SELECT 
    DATE(timestamp) as day,
    endpoint,
    SUM(jobs_fetched) as jobs_fetched,
    SUM(request_count) as requests_made,
    AVG(response_time_ms) as avg_response_time_ms,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successes
FROM dayonejobs_api_usage_logs
WHERE DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE(timestamp), endpoint
ORDER BY day DESC, endpoint;

-- ============================================================================
-- View: job_stats_daily
-- Purpose: Daily job statistics (posted, active, expired)
-- Usage: SELECT * FROM job_stats_daily ORDER BY date_posted DESC LIMIT 30;
-- ============================================================================
CREATE VIEW job_stats_daily AS
SELECT 
    DATE(date_posted) as date_posted,
    COUNT(*) as total_jobs,
    COUNT(DISTINCT organization) as unique_companies,
    COUNT(CASE WHEN remote_derived = true THEN 1 END) as remote_jobs,
    COUNT(CASE WHEN is_expired = false THEN 1 END) as active_jobs,
    COUNT(CASE WHEN is_expired = true THEN 1 END) as expired_jobs,
    COUNT(CASE WHEN ai_visa_sponsorship = true THEN 1 END) as visa_sponsored_jobs
FROM dayonejobs_jobs
GROUP BY DATE(date_posted)
ORDER BY date_posted DESC;

-- ============================================================================
-- View: job_stats_by_source
-- Purpose: Job statistics grouped by source
-- Usage: SELECT * FROM job_stats_by_source ORDER BY total_jobs DESC;
-- ============================================================================
CREATE VIEW job_stats_by_source AS
SELECT 
    COALESCE(source, 'Unknown') as source,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN is_expired = false THEN 1 END) as active_jobs,
    COUNT(CASE WHEN remote_derived = true THEN 1 END) as remote_jobs,
    COUNT(DISTINCT organization) as unique_companies,
    MIN(date_posted) as oldest_job_date,
    MAX(date_posted) as newest_job_date
FROM dayonejobs_jobs
GROUP BY source
ORDER BY total_jobs DESC;

-- ============================================================================
-- View: budget_status_current
-- Purpose: Current month budget utilization at a glance
-- Usage: SELECT * FROM budget_status_current;
-- ============================================================================
CREATE VIEW budget_status_current AS
SELECT 
    COALESCE(SUM(request_count), 0) as requests_used,
    20000 as requests_limit,
    ROUND(
        (COALESCE(SUM(request_count), 0)::numeric / 20000 * 100), 2
    ) as requests_percentage,
    20000 - COALESCE(SUM(request_count), 0) as requests_remaining,
    
    COALESCE(SUM(jobs_fetched), 0) as jobs_used,
    20000 as jobs_limit,
    ROUND(
        (COALESCE(SUM(jobs_fetched), 0)::numeric / 20000 * 100), 2
    ) as jobs_percentage,
    20000 - COALESCE(SUM(jobs_fetched), 0) as jobs_remaining,
    
    DATE_TRUNC('month', CURRENT_DATE) as current_month,
    ROUND(AVG(response_time_ms), 2) as avg_response_time_ms,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as total_errors
FROM dayonejobs_api_usage_logs
WHERE DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', CURRENT_DATE);

-- ============================================================================
-- Grant SELECT permissions (adjust based on your security needs)
-- ============================================================================
-- GRANT SELECT ON api_usage_monthly TO your_readonly_role;
-- GRANT SELECT ON api_usage_daily TO your_readonly_role;
-- GRANT SELECT ON job_stats_daily TO your_readonly_role;
-- GRANT SELECT ON job_stats_by_source TO your_readonly_role;
-- GRANT SELECT ON budget_status_current TO your_readonly_role;


