const API_BASE = import.meta.env.VITE_API_URL || '';

export function buildApiUrl(path: string): string {
  if (API_BASE) {
    return `${API_BASE}${path}`;
  }
  return path;
}
