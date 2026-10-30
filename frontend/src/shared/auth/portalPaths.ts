import { getSessionUser } from './session';
import { houseHome, mapLegacyPath, resolveHouse } from './territory';

/** Resolve canonical module links at use time, after login or a change of session. */
export function portalPathForSession(path: string, roles?: readonly string[]): string {
  const house = resolveHouse(roles ?? getSessionUser()?.roles);
  if (!house) return '/login';
  const url = new URL(path, 'http://edusmart.local');
  const destination = mapLegacyPath(url.pathname, house);
  return destination === houseHome(house) && url.pathname !== '/admin'
    ? destination
    : `${destination}${url.search}${url.hash}`;
}
