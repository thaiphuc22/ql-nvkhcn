export function getAppRouteUrl(route: string): string {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`
  return `${import.meta.env.BASE_URL}#${normalizedRoute}`
}

export function openAppRoute(route: string): void {
  window.open(getAppRouteUrl(route), '_blank')
}
