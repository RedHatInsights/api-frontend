/**
 * URL validation utilities for securing swagger-ui spec loading
 * and request interceptor token attachment.
 *
 * Prevents credential exfiltration via crafted ?url= or ?github-* query params.
 */

/**
 * Allowed Red Hat GitHub organizations for loading OpenAPI specs.
 * Lowercase for case-insensitive comparison.
 */
const ALLOWED_GITHUB_OWNERS = new Set([
  'redhatinsights',
  'redhatofficial',
  'redhat-developer',
  'redhat-certification',
  'ansible',
  'project-koku',
  'consoledot',
]);

/**
 * Check if a URL is same-origin or a relative path.
 * Only same-origin URLs should receive the Authorization header.
 */
export const isSameOriginUrl = (url: string | undefined): boolean => {
  if (!url) {
    return false;
  }

  // Protocol-relative URLs (//evil.com) are NOT same-origin — reject early
  // Relative URLs starting with single / are same-origin
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.origin === location.origin;
  } catch {
    return false;
  }
};

/**
 * Check if a GitHub owner is in the allowed Red Hat organizations list.
 */
export const isAllowedGitHubOwner = (owner: string): boolean => {
  return ALLOWED_GITHUB_OWNERS.has(owner.toLowerCase());
};

/**
 * Validate a spec URL - must be same-origin (relative or absolute).
 * External absolute URLs are rejected to prevent loading attacker-controlled specs.
 */
export const isAllowedSpecUrl = (url: string): boolean => {
  // Protocol-relative URLs (//evil.com) are NOT same-origin — reject early
  // Relative URLs starting with single / are always same-origin
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.origin === location.origin;
  } catch {
    return false;
  }
};

/**
 * Filter server entries to only include same-origin URLs.
 * Prevents swagger-ui Try-it-out from sending requests to external servers
 * defined in attacker-controlled specs.
 */
export const filterSameOriginServers = (
  servers: Array<{ url: string; [key: string]: unknown }>
): Array<{ url: string; [key: string]: unknown }> => {
  return servers.filter((server) => {
    // Protocol-relative URLs (//evil.com) must not be treated as relative paths
    const isRelativePath =
      server.url.indexOf('/') === 0 && server.url.indexOf('//') !== 0;
    const serverUrl = isRelativePath
      ? `${location.origin}${server.url}`
      : server.url;
    try {
      const parsed = new URL(serverUrl);
      return parsed.origin === location.origin;
    } catch {
      return false;
    }
  });
};
