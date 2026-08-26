/**
 * Central registry of every {@link Tool} the server exposes.
 *
 * Imported by both transport bootstraps. The transport passes a
 * `register` callback that wires each tool into the underlying MCP
 * SDK. This indirection keeps every tool's generic types narrow:
 * the registry never widens `Tool<Input, Output>` to `Tool<unknown,
 * unknown>` and there is no `any` anywhere on the data path.
 *
 * Composition-root-style file: grandfathered for the 200-LOC file-size
 * rule because its length scales with tool count, not design
 * complexity (`scripts/check-file-sizes.ts` GRANDFATHERED).
 */

import type { RegisterTool } from "./tools/_shared/tool.js";
import { createApiKeyTool } from "./tools/account/create-api-key.tool.js";
import { createCustomRoleTool } from "./tools/account/create-custom-role.tool.js";
import { getAccountTool } from "./tools/account/get-account.tool.js";
import { inviteUserTool } from "./tools/account/invite-user.tool.js";
import { listAccountLabelsTool } from "./tools/account/list-account-labels.tool.js";
import { listApiKeysTool } from "./tools/account/list-api-keys.tool.js";
import { listOrgRolesTool } from "./tools/account/list-org-roles.tool.js";
import { listOrgUsersTool } from "./tools/account/list-org-users.tool.js";
import { removeUserTool } from "./tools/account/remove-user.tool.js";
import { revokeApiKeyTool } from "./tools/account/revoke-api-key.tool.js";
import { transferOwnershipTool } from "./tools/account/transfer-ownership.tool.js";
import { updateAccountLabelsTool } from "./tools/account/update-account-labels.tool.js";
import { updateOrgTool } from "./tools/account/update-org.tool.js";
import { updateUserRoleTool } from "./tools/account/update-user-role.tool.js";
import { deleteAlertDestinationTool } from "./tools/alert-notifications/delete-alert-destination.tool.js";
import { getCampaignAlertOverridesTool } from "./tools/alert-notifications/get-campaign-alert-overrides.tool.js";
import { listAlertDestinationsTool } from "./tools/alert-notifications/list-alert-destinations.tool.js";
import { setAlertDestinationVersionTool } from "./tools/alert-notifications/set-alert-destination-version.tool.js";
import { setCampaignAlertOverridesTool } from "./tools/alert-notifications/set-campaign-alert-overrides.tool.js";
import { bulkUpdateAlertStatusTool } from "./tools/alerts/bulk-update-alert-status.tool.js";
import { getAlertStatsTool } from "./tools/alerts/get-alert-stats.tool.js";
import { listAlertsTool } from "./tools/alerts/list-alerts.tool.js";
import { updateAlertStatusTool } from "./tools/alerts/update-alert-status.tool.js";
import { getBillingSummaryTool } from "./tools/billing/get-billing-summary.tool.js";
import { getUsageSummaryTool } from "./tools/billing/get-usage-summary.tool.js";
import { listBalanceHistoryTool } from "./tools/billing/list-balance-history.tool.js";
import { listUsageTool } from "./tools/billing/list-usage.tool.js";
import { archiveCampaignGroupTool } from "./tools/campaign-groups/archive-campaign-group.tool.js";
import { cancelCampaignGroupTool } from "./tools/campaign-groups/cancel-campaign-group.tool.js";
import { createCampaignGroupTool } from "./tools/campaign-groups/create-campaign-group.tool.js";
import { getCampaignGroupTool } from "./tools/campaign-groups/get-campaign-group.tool.js";
import { listCampaignGroupsTool } from "./tools/campaign-groups/list-campaign-groups.tool.js";
import { pauseCampaignGroupScheduleTool } from "./tools/campaign-groups/pause-campaign-group-schedule.tool.js";
import { resumeCampaignGroupScheduleTool } from "./tools/campaign-groups/resume-campaign-group-schedule.tool.js";
import { runCampaignGroupTool } from "./tools/campaign-groups/run-campaign-group.tool.js";
import { unarchiveCampaignGroupTool } from "./tools/campaign-groups/unarchive-campaign-group.tool.js";
import { updateCampaignGroupTool } from "./tools/campaign-groups/update-campaign-group.tool.js";
import { archiveCampaignTool } from "./tools/campaigns/archive-campaign.tool.js";
import { cancelCampaignTool } from "./tools/campaigns/cancel-campaign.tool.js";
import { createCampaignTool } from "./tools/campaigns/create-campaign.tool.js";
import { getCampaignTool } from "./tools/campaigns/get-campaign.tool.js";
import { listCampaignRunsTool } from "./tools/campaigns/list-campaign-runs.tool.js";
import { listCampaignsTool } from "./tools/campaigns/list-campaigns.tool.js";
import { listCampaignsPickerTool } from "./tools/campaigns/list-campaigns-picker.tool.js";
import { runCampaignTool } from "./tools/campaigns/run-campaign.tool.js";
import { unarchiveCampaignTool } from "./tools/campaigns/unarchive-campaign.tool.js";
import { updateCampaignTool } from "./tools/campaigns/update-campaign.tool.js";
import { createCustomRuleTool } from "./tools/custom-rules/create-custom-rule.tool.js";
import { deleteCustomRuleTool } from "./tools/custom-rules/delete-custom-rule.tool.js";
import { getCustomRuleTool } from "./tools/custom-rules/get-custom-rule.tool.js";
import { listCustomRulesTool } from "./tools/custom-rules/list-custom-rules.tool.js";
import { testCustomRuleTool } from "./tools/custom-rules/test-custom-rule.tool.js";
import { updateCustomRuleTool } from "./tools/custom-rules/update-custom-rule.tool.js";
import { createCustomTaxonomyTool } from "./tools/custom-taxonomies/create-custom-taxonomy.tool.js";
import { deleteCustomTaxonomyTool } from "./tools/custom-taxonomies/delete-custom-taxonomy.tool.js";
import { getCustomTaxonomyTool } from "./tools/custom-taxonomies/get-custom-taxonomy.tool.js";
import { listCustomTaxonomiesTool } from "./tools/custom-taxonomies/list-custom-taxonomies.tool.js";
import { parseCustomTaxonomyTextTool } from "./tools/custom-taxonomies/parse-custom-taxonomy-text.tool.js";
import { restoreCustomTaxonomyTool } from "./tools/custom-taxonomies/restore-custom-taxonomy.tool.js";
import { updateCustomTaxonomyTool } from "./tools/custom-taxonomies/update-custom-taxonomy.tool.js";
import { listEmulatorsTool } from "./tools/emulators/list-emulators.tool.js";
import { getProxyTargetingTool } from "./tools/geos/get-proxy-targeting.tool.js";
import { listGeosTool } from "./tools/geos/list-geos.tool.js";
import { getInvoicePdfTool } from "./tools/invoicing/get-invoice-pdf.tool.js";
import { listInvoicesTool } from "./tools/invoicing/list-invoices.tool.js";
import { attachPolicySetCampaignsTool } from "./tools/policy-sets/attach-policy-set-campaigns.tool.js";
import { createPolicySetTool } from "./tools/policy-sets/create-policy-set.tool.js";
import { deletePolicySetTool } from "./tools/policy-sets/delete-policy-set.tool.js";
import { detachPolicySetCampaignsTool } from "./tools/policy-sets/detach-policy-set-campaigns.tool.js";
import { getPolicySetTool } from "./tools/policy-sets/get-policy-set.tool.js";
import { listPolicySetCampaignsTool } from "./tools/policy-sets/list-policy-set-campaigns.tool.js";
import { listPolicySetsTool } from "./tools/policy-sets/list-policy-sets.tool.js";
import { requestPolicySetApprovalTool } from "./tools/policy-sets/request-policy-set-approval.tool.js";
import { unpublishPolicySetTool } from "./tools/policy-sets/unpublish-policy-set.tool.js";
import { updatePolicySetTool } from "./tools/policy-sets/update-policy-set.tool.js";
import { cancelRunTool } from "./tools/runs/cancel-run.tool.js";
import { getRunTool } from "./tools/runs/get-run.tool.js";
import { listRunScansTool } from "./tools/runs/list-run-scans.tool.js";
import { cancelScanTool } from "./tools/scans/cancel-scan.tool.js";
import { createBulkScansTool } from "./tools/scans/create-bulk-scans.tool.js";
import { createScanTool } from "./tools/scans/create-scan.tool.js";
import { getScanTool } from "./tools/scans/get-scan.tool.js";
import { getScanCreativeHtmlTool } from "./tools/scans/get-scan-creative-html.tool.js";
import { getScanCreativeScreenshotTool } from "./tools/scans/get-scan-creative-screenshot.tool.js";
import { getScanCreativeVideoTool } from "./tools/scans/get-scan-creative-video.tool.js";
import { getScanLandingScreenshotTool } from "./tools/scans/get-scan-landing-screenshot.tool.js";
import { getScanScreenshotTool } from "./tools/scans/get-scan-screenshot.tool.js";
import { getScanVastXmlTool } from "./tools/scans/get-scan-vast-xml.tool.js";
import { listScanChildrenTool } from "./tools/scans/list-scan-children.tool.js";
import { listScansTool } from "./tools/scans/list-scans.tool.js";
import { recheckScansTool } from "./tools/scans/recheck-scans.tool.js";
import { deleteTagDefinitionTool } from "./tools/tags/delete-tag-definition.tool.js";
import { getTagDefinitionTool } from "./tools/tags/get-tag-definition.tool.js";
import { listScanTagsTool } from "./tools/tags/list-scan-tags.tool.js";
import { listTagsTool } from "./tools/tags/list-tags.tool.js";
import { updateTagDefinitionTool } from "./tools/tags/update-tag-definition.tool.js";
import { bulkReplayWebhookTool } from "./tools/webhooks/bulk-replay-webhook.tool.js";
import { createWebhookTool } from "./tools/webhooks/create-webhook.tool.js";
import { deleteWebhookTool } from "./tools/webhooks/delete-webhook.tool.js";
import { getWebhookTool } from "./tools/webhooks/get-webhook.tool.js";
import { listWebhookDeliveriesTool } from "./tools/webhooks/list-webhook-deliveries.tool.js";
import { listWebhookEventTypesTool } from "./tools/webhooks/list-webhook-event-types.tool.js";
import { listWebhooksTool } from "./tools/webhooks/list-webhooks.tool.js";
import { replayWebhookDeliveryTool } from "./tools/webhooks/replay-webhook-delivery.tool.js";
import { rotateWebhookSecretTool } from "./tools/webhooks/rotate-webhook-secret.tool.js";
import { testWebhookTool } from "./tools/webhooks/test-webhook.tool.js";
import { updateWebhookTool } from "./tools/webhooks/update-webhook.tool.js";

/**
 * Register every tool with the supplied callback. Grouped by domain
 * for readability — no order significance.
 */
export function registerAllTools(register: RegisterTool): void {
  // account
  register(getAccountTool);
  register(updateOrgTool);
  register(listOrgUsersTool);
  register(inviteUserTool);
  register(updateUserRoleTool);
  register(removeUserTool);
  register(transferOwnershipTool);
  register(listOrgRolesTool);
  register(createCustomRoleTool);
  register(listAccountLabelsTool);
  register(updateAccountLabelsTool);
  register(listApiKeysTool);
  register(createApiKeyTool);
  register(revokeApiKeyTool);
  // reference data
  register(listGeosTool);
  register(listEmulatorsTool);
  register(getProxyTargetingTool);
  // scans
  register(getScanTool);
  register(listScanChildrenTool);
  register(listScansTool);
  register(cancelScanTool);
  register(createBulkScansTool);
  register(createScanTool);
  register(recheckScansTool);
  register(getScanScreenshotTool);
  register(getScanCreativeScreenshotTool);
  register(getScanLandingScreenshotTool);
  register(getScanCreativeHtmlTool);
  register(getScanCreativeVideoTool);
  register(getScanVastXmlTool);
  // campaigns
  register(getCampaignTool);
  register(listCampaignsTool);
  register(archiveCampaignTool);
  register(unarchiveCampaignTool);
  register(cancelCampaignTool);
  register(runCampaignTool);
  register(createCampaignTool);
  register(updateCampaignTool);
  register(listCampaignRunsTool);
  register(listCampaignsPickerTool);
  // runs
  register(getRunTool);
  register(listRunScansTool);
  register(cancelRunTool);
  // campaign groups
  register(getCampaignGroupTool);
  register(listCampaignGroupsTool);
  register(createCampaignGroupTool);
  register(updateCampaignGroupTool);
  register(runCampaignGroupTool);
  register(cancelCampaignGroupTool);
  register(archiveCampaignGroupTool);
  register(unarchiveCampaignGroupTool);
  register(pauseCampaignGroupScheduleTool);
  register(resumeCampaignGroupScheduleTool);
  // tags
  register(listTagsTool);
  register(getTagDefinitionTool);
  register(updateTagDefinitionTool);
  register(deleteTagDefinitionTool);
  register(listScanTagsTool);
  // custom rules
  register(listCustomRulesTool);
  register(getCustomRuleTool);
  register(createCustomRuleTool);
  register(updateCustomRuleTool);
  register(deleteCustomRuleTool);
  register(testCustomRuleTool);
  // custom taxonomies (per-org classification trees)
  register(listCustomTaxonomiesTool);
  register(getCustomTaxonomyTool);
  register(createCustomTaxonomyTool);
  register(updateCustomTaxonomyTool);
  register(deleteCustomTaxonomyTool);
  register(restoreCustomTaxonomyTool);
  register(parseCustomTaxonomyTextTool);
  // policy sets
  register(listPolicySetsTool);
  register(getPolicySetTool);
  register(createPolicySetTool);
  register(updatePolicySetTool);
  register(deletePolicySetTool);
  register(requestPolicySetApprovalTool);
  register(unpublishPolicySetTool);
  register(listPolicySetCampaignsTool);
  register(attachPolicySetCampaignsTool);
  register(detachPolicySetCampaignsTool);
  // alerts
  register(listAlertsTool);
  register(updateAlertStatusTool);
  register(bulkUpdateAlertStatusTool);
  register(getAlertStatsTool);
  // webhooks
  register(listWebhooksTool);
  register(getWebhookTool);
  register(createWebhookTool);
  register(updateWebhookTool);
  register(deleteWebhookTool);
  register(listWebhookEventTypesTool);
  register(listWebhookDeliveriesTool);
  register(testWebhookTool);
  register(rotateWebhookSecretTool);
  register(replayWebhookDeliveryTool);
  register(bulkReplayWebhookTool);
  // billing
  register(getBillingSummaryTool);
  register(listUsageTool);
  register(getUsageSummaryTool);
  register(listBalanceHistoryTool);
  // invoicing
  register(listInvoicesTool);
  register(getInvoicePdfTool);
  // alert notifications
  register(listAlertDestinationsTool);
  register(deleteAlertDestinationTool);
  register(setAlertDestinationVersionTool);
  register(getCampaignAlertOverridesTool);
  register(setCampaignAlertOverridesTool);
}
