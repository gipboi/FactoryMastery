export const getSubdomain = () => {
  const hostname = window.location.hostname;

  // Remove 'www.' prefix if present
  const parts = hostname.replace(/^(www\.)/, '').split('.');

  // Handle localhost with subdomains
  if (hostname.includes('localhost')) {
    // For 'altec.localhost' or 'altec.altec.localhost'
    if (parts.length > 1) {
      return parts[0]; // Return 'altec' for 'altec.localhost' or 'altec.altec.localhost'
    }
    return ''; // No subdomain on localhost
  }

  // For real domains: Handle subdomains (e.g., 'altec.altec.domain.com')
  if (parts.length > 2) {
    return parts[0]; // First part is the subdomain
  }

  return ''; // No subdomain
}
