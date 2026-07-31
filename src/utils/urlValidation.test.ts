import {
  filterSameOriginServers,
  isAllowedGitHubOwner,
  isAllowedSpecUrl,
  isSameOriginUrl,
} from './urlValidation';

// Mock location.origin
const ORIGIN = 'https://console.redhat.com';

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: { origin: ORIGIN },
    writable: true,
  });
});

describe('isSameOriginUrl', () => {
  it('returns true for relative URLs', () => {
    expect(isSameOriginUrl('/api/v1/openapi.json')).toBe(true);
    expect(isSameOriginUrl('/docs/api/foo')).toBe(true);
  });

  it('returns true for same-origin absolute URLs', () => {
    expect(isSameOriginUrl(`${ORIGIN}/api/v1/openapi.json`)).toBe(true);
  });

  it('returns false for cross-origin URLs', () => {
    expect(isSameOriginUrl('https://evil.com/steal-token')).toBe(false);
    expect(isSameOriginUrl('https://api.github.com/repos/foo/bar')).toBe(false);
  });

  it('returns false for undefined/empty', () => {
    expect(isSameOriginUrl(undefined)).toBe(false);
    expect(isSameOriginUrl('')).toBe(false);
  });

  it('returns false for malformed URLs', () => {
    expect(isSameOriginUrl('not-a-url')).toBe(false);
  });

  it('returns false for protocol-relative URLs (double slash)', () => {
    expect(isSameOriginUrl('//evil.com/steal-token')).toBe(false);
    expect(isSameOriginUrl('//attacker.io/path')).toBe(false);
  });
});

describe('isAllowedGitHubOwner', () => {
  it('allows Red Hat organizations (case-insensitive)', () => {
    expect(isAllowedGitHubOwner('RedHatInsights')).toBe(true);
    expect(isAllowedGitHubOwner('redhatinsights')).toBe(true);
    expect(isAllowedGitHubOwner('REDHATINSIGHTS')).toBe(true);
    expect(isAllowedGitHubOwner('RedHatOfficial')).toBe(true);
    expect(isAllowedGitHubOwner('ansible')).toBe(true);
    expect(isAllowedGitHubOwner('project-koku')).toBe(true);
    expect(isAllowedGitHubOwner('consoledot')).toBe(true);
  });

  it('rejects unknown organizations', () => {
    expect(isAllowedGitHubOwner('evil-org')).toBe(false);
    expect(isAllowedGitHubOwner('attacker')).toBe(false);
    expect(isAllowedGitHubOwner('randomuser')).toBe(false);
  });
});

describe('isAllowedSpecUrl', () => {
  it('allows relative URLs', () => {
    expect(isAllowedSpecUrl('/api/v1/openapi.json')).toBe(true);
  });

  it('allows same-origin absolute URLs', () => {
    expect(isAllowedSpecUrl(`${ORIGIN}/api/v1/openapi.json`)).toBe(true);
  });

  it('rejects cross-origin URLs', () => {
    expect(isAllowedSpecUrl('https://evil.com/malicious-spec.json')).toBe(
      false
    );
    expect(isAllowedSpecUrl('http://attacker.com/openapi.json')).toBe(false);
  });

  it('rejects protocol-relative URLs (double slash)', () => {
    expect(isAllowedSpecUrl('//evil.com/malicious-spec.json')).toBe(false);
    expect(isAllowedSpecUrl('//attacker.io/openapi.json')).toBe(false);
  });
});

describe('filterSameOriginServers', () => {
  it('keeps relative path servers', () => {
    const servers = [{ url: '/api/foo/v1' }, { url: '/api/bar/v2' }];
    expect(filterSameOriginServers(servers)).toEqual(servers);
  });

  it('keeps same-origin absolute servers', () => {
    const servers = [{ url: `${ORIGIN}/api/foo/v1` }];
    expect(filterSameOriginServers(servers)).toEqual(servers);
  });

  it('removes cross-origin servers', () => {
    const servers = [
      { url: '/api/foo/v1' },
      { url: 'https://evil.com/api' },
      { url: 'https://attacker.io/steal' },
    ];
    expect(filterSameOriginServers(servers)).toEqual([{ url: '/api/foo/v1' }]);
  });

  it('removes protocol-relative URL servers (double slash)', () => {
    const servers = [
      { url: '/api/foo/v1' },
      { url: '//evil.com/api' },
      { url: '//attacker.io/steal' },
    ];
    expect(filterSameOriginServers(servers)).toEqual([{ url: '/api/foo/v1' }]);
  });

  it('returns empty array when all servers are external', () => {
    const servers = [{ url: 'https://evil.com/api' }];
    expect(filterSameOriginServers(servers)).toEqual([]);
  });
});
