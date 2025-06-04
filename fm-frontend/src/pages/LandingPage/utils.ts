/**
 * Gets the subdomain from the current URL
 * @returns The subdomain string or empty string if no subdomain
 */
export const getSubdomain = (): string => {
  const hostname = window.location.hostname;

  // Handle localhost for development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "";
  }

  // Handle IP addresses
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return "";
  }

  // Remove www. if present
  const host = hostname.replace(/^www\./, "");

  // Split by dots and check if we have a subdomain
  const parts = host.split(".");

  // If we have more than 2 parts (e.g., sub.domain.com), the first part is the subdomain
  if (parts.length > 2) {
    return parts[0];
  }

  return "";
};
