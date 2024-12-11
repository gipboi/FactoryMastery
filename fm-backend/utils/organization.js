function convertToSubdomain(name) {
  if (name) {
    const withHyphens = name?.replace(/([a-z])([A-Z])/g, "$1-$2");
    const subdomain = withHyphens?.toLowerCase();
    const formatted = subdomain?.replace(/\s+/g, "-");
    const validChars = formatted?.replace(/[^a-z0-9-]/g, "");
    const trimmed = validChars?.replace(/^-|-$/g, "");
    return trimmed;
  }
  return "";
}

export { convertToSubdomain };
