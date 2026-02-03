export const ASSET_BASE_URL = "https://gaa-events.vercel.app";

export function getAssetUrl(path: string): string {
  return `${ASSET_BASE_URL}${path}`;
}
