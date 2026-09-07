/**
 * Canonical origin for the site.
 *
 * Must stay on the `www` host: the apex domain is not served by Vercel (its A records
 * point at an AWS load balancer serving an older site) and has no valid certificate,
 * so canonical URLs, OpenGraph URLs, and the sitemap all have to use this one.
 */
export const SITE_URL = "https://www.vedanshujoshi.com";

/** Fallback contact address, used when KV has no stored override. */
export const CONTACT_EMAIL = "vedanshujoshi0@gmail.com";
