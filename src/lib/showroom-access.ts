export function canAccessProductionShowroom(
  login: string | null | undefined,
  owner: string | null | undefined,
) {
  return Boolean(login && owner && login.toLowerCase() === owner.toLowerCase());
}
