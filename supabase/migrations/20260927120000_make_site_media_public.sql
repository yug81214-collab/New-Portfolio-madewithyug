-- Portfolio media is intentionally public so browser/CDN caching works without signed URL churn.
UPDATE storage.buckets
SET public = true
WHERE id = 'site-media';
