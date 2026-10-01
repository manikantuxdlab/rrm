/**
 * Application-wide site configuration and metadata
 */

export const siteConfig = {
  name: "RRRM Safety Admin",
  title: "Reliable Risk & Resource Management",
  description: "Enterprise Construction Safety & Compliance Intelligence Portal",
  version: "1.0.0",
  author: {
    name: "RRRM Safety Team",
    url: "#",
  },
  company: {
    name: "Reliable Risk & Resource Management LLC",
    phone: "(800) 555-RRRM",
    supportEmail: "safety@reliableriskmgmt.com",
    claimsEmail: "claims@reliableriskmgmt.com",
  },
}

export type SiteConfig = typeof siteConfig
