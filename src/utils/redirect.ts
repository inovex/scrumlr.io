// redirects shouldn't go to paths where settings are open.
// this function removes the settings path from the pathname.
export const normalizeRedirectPathname = (pathname: string) => {
  const settingsIndex = pathname.indexOf("/settings");
  if (settingsIndex === -1) return pathname;

  const trimmed = pathname.slice(0, settingsIndex);
  return trimmed.length > 0 ? trimmed : "/";
};
