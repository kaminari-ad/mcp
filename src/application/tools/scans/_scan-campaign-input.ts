/**
 * Shared zod fields for campaign attribution and publisher ad discovery.
 *
 * `create_scan` and `create_bulk_scans` both accept them. `campaign_id`
 * carries the one fact an agent cannot guess: without it a scan is checked
 * and tagged but never raises an alert, because policies hang off campaigns.
 */
import { z } from "zod";

export const scanCampaignIdField = z
  .string()
  .uuid()
  .optional()
  .describe(
    "Optional campaign UUID to attribute the scan to. Required for alerts: " +
      "policies are attached to campaigns, so a scan without a campaign is checked " +
      "and tagged but never raises an alert."
  );

export const scanRunIdField = z
  .string()
  .uuid()
  .optional()
  .describe(
    "Optional run UUID inside the campaign. Omit it to join the campaign's API run for the day."
  );

export const scanAdDiscoveryField = z
  .boolean()
  .optional()
  .describe(
    "Publisher ad discovery: detect ad blocks on the page and spawn one child " +
      "scan per detected ad (banner/video/pop). Only valid with `url`. Each child is a " +
      "separate billed scan; list them with `list_scan_children`."
  );
