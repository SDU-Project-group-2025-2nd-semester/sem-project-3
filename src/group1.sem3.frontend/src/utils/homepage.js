export function homepagePathForRole(role) {
  const r = Number(role);
  if (r === 0) return "/user/homepage";
  if (r === 1) return "/staff/homepage";
  if (r === 2) return "/admin/usersManager";
  return "/";
}

export function navigateToHomepage(navigate, role) {
  navigate(homepagePathForRole(role));
}