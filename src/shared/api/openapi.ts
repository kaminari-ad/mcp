/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source : https://kaminari.ad/openapi.json (cached locally during
 *          generation; the live URL is the canonical source).
 * Tool   : openapi-typescript
 * Refresh: `npm run gen:api-types`
 *
 * CI diffs this file against the committed copy; mismatches fail the
 * build, forcing the API-changing MR to bring this file along.
 */

/* eslint-disable */

export interface paths {
  "/api/v1/account": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Org
     * @description Return the caller's organization.
     */
    get: operations["get_org_api_v1_account_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Update Org
     * @description Update the caller's organization name.
     */
    patch: operations["update_org_api_v1_account_patch"];
    trace?: never;
  };
  "/api/v1/account/labels": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Labels
     * @description List custom label definitions for the caller's organization.
     */
    get: operations["list_labels_api_v1_account_labels_get"];
    /**
     * Update Labels
     * @description Replace all custom label definitions for the organization.
     */
    put: operations["update_labels_api_v1_account_labels_put"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/account/users": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Org Users
     * @description List users in the caller's organization.
     */
    get: operations["list_org_users_api_v1_account_users_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/account/users/invite": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Invite User
     * @description Invite a new user to the caller's organization.
     */
    post: operations["invite_user_api_v1_account_users_invite_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/account/users/{user_id}/role": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Update User Role
     * @description Change a user's role within the organization.
     */
    patch: operations["update_user_role_api_v1_account_users__user_id__role_patch"];
    trace?: never;
  };
  "/api/v1/account/users/{user_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Remove User
     * @description Soft-delete a user from the organization.
     */
    delete: operations["remove_user_api_v1_account_users__user_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/account/users/{user_id}/transfer-ownership": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Transfer Ownership
     * @description Transfer organization ownership to another user.
     */
    post: operations["transfer_ownership_api_v1_account_users__user_id__transfer_ownership_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/account/api-keys": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Api Keys
     * @description List API keys in the caller's organization.
     */
    get: operations["list_api_keys_api_v1_account_api_keys_get"];
    put?: never;
    /**
     * Create Api Key
     * @description Create a new API key (full key shown once).
     */
    post: operations["create_api_key_api_v1_account_api_keys_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/account/api-keys/{key_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Revoke Api Key
     * @description Revoke (delete) an API key.
     */
    delete: operations["revoke_api_key_api_v1_account_api_keys__key_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/account/roles": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Org Roles
     * @description List roles available to the caller's organization.
     */
    get: operations["list_org_roles_api_v1_account_roles_get"];
    put?: never;
    /**
     * Create Custom Role
     * @description Create a custom role for the organization.
     */
    post: operations["create_custom_role_api_v1_account_roles_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Scans
     * @description List scans with filters. Comma-separated values for multi-select.
     */
    get: operations["list_scans_api_v1_scans_get"];
    put?: never;
    /**
     * Create Scan
     * @description Create a new scan for a single URL + country.
     */
    post: operations["create_scan_api_v1_scans_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/bulk": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Create Bulk Scans
     * @description Create scans for a URL across multiple countries at once.
     */
    post: operations["create_bulk_scans_api_v1_scans_bulk_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/recheck": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Recheck Scans
     * @description Re-check completed scans through the checker pipeline with current rules.
     */
    post: operations["recheck_scans_api_v1_scans_recheck_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/{scan_id}/cancel": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Cancel Scan
     * @description Cancel a single pending scan.
     */
    post: operations["cancel_scan_api_v1_scans__scan_id__cancel_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/{scan_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Scan
     * @description Get a scan by ID.
     */
    get: operations["get_scan_api_v1_scans__scan_id__get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/{scan_id}/screenshot": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Screenshot
     * @description Serve screenshot, optionally resized to *w* pixels wide. Public endpoint.
     */
    get: operations["get_screenshot_api_v1_scans__scan_id__screenshot_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/{scan_id}/creative-screenshot": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Creative Screenshot
     * @description Serve creative screenshot for ad tag scans. Public endpoint.
     */
    get: operations["get_creative_screenshot_api_v1_scans__scan_id__creative_screenshot_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/{scan_id}/landings/{landing_ord}/screenshot": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Landing Screenshot
     * @description Serve one landing-tab screenshot for an ad-tag scan. Public endpoint.
     */
    get: operations["get_landing_screenshot_api_v1_scans__scan_id__landings__landing_ord__screenshot_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/geos": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Geos
     * @description Return all supported geographic regions.
     */
    get: operations["list_geos_api_v1_geos_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/emulators": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Emulators
     * @description Return all active emulators in the catalog.
     */
    get: operations["list_emulators_api_v1_emulators_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaign-groups": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Groups
     * @description List campaign groups filtered by archive status.
     */
    get: operations["list_groups_api_v1_campaign_groups_get"];
    put?: never;
    /**
     * Create Group
     * @description Create a new campaign group.
     */
    post: operations["create_group_api_v1_campaign_groups_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaign-groups/{group_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Group
     * @description Return a single campaign group by ID.
     */
    get: operations["get_group_api_v1_campaign_groups__group_id__get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Update Group
     * @description Rename a campaign group.
     */
    patch: operations["update_group_api_v1_campaign_groups__group_id__patch"];
    trace?: never;
  };
  "/api/v1/campaign-groups/{group_id}/archive": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Archive Group
     * @description Cascade-archive the group and all its campaigns.
     */
    post: operations["archive_group_api_v1_campaign_groups__group_id__archive_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaign-groups/{group_id}/unarchive": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Unarchive Group
     * @description Cascade-unarchive the group and all its campaigns.
     */
    post: operations["unarchive_group_api_v1_campaign_groups__group_id__unarchive_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaign-groups/{group_id}/pause-schedule": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Pause Group Schedule
     * @description Pause the schedule for every campaign in the group.
     */
    post: operations["pause_group_schedule_api_v1_campaign_groups__group_id__pause_schedule_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaign-groups/{group_id}/resume-schedule": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Resume Group Schedule
     * @description Resume the schedule for every campaign in the group.
     */
    post: operations["resume_group_schedule_api_v1_campaign_groups__group_id__resume_schedule_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaign-groups/{group_id}/cancel": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Cancel Group
     * @description Cancel pending scans for every non-archived campaign in the group.
     */
    post: operations["cancel_group_api_v1_campaign_groups__group_id__cancel_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaign-groups/{group_id}/run": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run Group
     * @description Trigger a run for every non-archived campaign in the group.
     */
    post: operations["run_group_api_v1_campaign_groups__group_id__run_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaigns": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Campaigns
     * @description List campaigns with optional filters + pagination.
     *
     *     ``limit`` is capped at 200; requests above that are rejected with 422
     *     rather than silently downgraded. Use ``page`` + ``limit`` to iterate
     *     through all results using the returned ``total``/``pages``.
     */
    get: operations["list_campaigns_api_v1_campaigns_get"];
    put?: never;
    /**
     * Create Campaign
     * @description Create a new campaign.
     */
    post: operations["create_campaign_api_v1_campaigns_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaigns/picker": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Campaigns For Picker
     * @description Capped lightweight list for dropdown / combobox consumers.
     *
     *     ``limit`` is capped at 100 (no pagination). For full iteration use
     *     the paginated ``GET /api/v1/campaigns`` endpoint.
     */
    get: operations["list_campaigns_for_picker_api_v1_campaigns_picker_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaigns/{campaign_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Campaign
     * @description Get a single campaign by ID.
     */
    get: operations["get_campaign_api_v1_campaigns__campaign_id__get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Update Campaign
     * @description Update campaign config. Only affects future runs.
     */
    patch: operations["update_campaign_api_v1_campaigns__campaign_id__patch"];
    trace?: never;
  };
  "/api/v1/campaigns/{campaign_id}/archive": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Archive Campaign
     * @description Move a campaign to the archive.
     */
    post: operations["archive_campaign_api_v1_campaigns__campaign_id__archive_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaigns/{campaign_id}/unarchive": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Unarchive Campaign
     * @description Restore a campaign from the archive.
     */
    post: operations["unarchive_campaign_api_v1_campaigns__campaign_id__unarchive_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaigns/{campaign_id}/run": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run Campaign
     * @description Trigger a new run for all campaign geos.
     */
    post: operations["run_campaign_api_v1_campaigns__campaign_id__run_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaigns/{campaign_id}/cancel": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Cancel Campaign
     * @description Cancel all pending scans for a campaign.
     */
    post: operations["cancel_campaign_api_v1_campaigns__campaign_id__cancel_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/campaigns/{campaign_id}/runs": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Runs
     * @description List run history for a campaign (paginated).
     *
     *     ``limit`` is capped at 200 — runs accrue over time (daily cron
     *     campaigns build up thousands of rows), so iteration via
     *     ``page``/``limit`` is mandatory instead of a single unbounded
     *     response.
     */
    get: operations["list_runs_api_v1_campaigns__campaign_id__runs_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/runs/{run_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Run
     * @description Get run detail with progress counters.
     */
    get: operations["get_run_api_v1_runs__run_id__get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/runs/{run_id}/cancel": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Cancel Run
     * @description Cancel all pending scans for a run.
     */
    post: operations["cancel_run_api_v1_runs__run_id__cancel_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/runs/{run_id}/scans": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Run Scans
     * @description List scan tiles for a run (paginated).
     *
     *     ``limit`` is capped at 200. Iterate via ``page``/``limit`` using
     *     the returned ``total``/``pages`` fields.
     */
    get: operations["list_run_scans_api_v1_runs__run_id__scans_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/{scan_id}/tags": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Scan Tags
     * @description List all tags for a scan.
     */
    get: operations["list_scan_tags_api_v1_scans__scan_id__tags_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/tag-definitions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Tag Definitions
     * @description List all available tag definitions with usage statistics.
     */
    get: operations["list_tag_definitions_api_v1_tag_definitions_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/tag-definitions/{slug}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Tag Definition
     * @description Get a tag definition with linked rules.
     */
    get: operations["get_tag_definition_api_v1_tag_definitions__slug__get"];
    put?: never;
    post?: never;
    /**
     * Delete Tag Definition
     * @description Delete a custom tag definition. Scan tag assignments cascade-delete.
     */
    delete: operations["delete_tag_definition_api_v1_tag_definitions__slug__delete"];
    options?: never;
    head?: never;
    /**
     * Update Tag Definition
     * @description Update display_name and/or description of a custom tag definition.
     */
    patch: operations["update_tag_definition_api_v1_tag_definitions__slug__patch"];
    trace?: never;
  };
  "/api/v1/custom-rules": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Custom Rules
     * @description List custom rules for the caller's organization (paginated).
     *
     *     ``limit`` is capped at 200 — iterate via ``page`` + ``limit`` and
     *     the returned ``total`` / ``pages``.
     */
    get: operations["list_custom_rules_api_v1_custom_rules_get"];
    put?: never;
    /**
     * Create Custom Rule
     * @description Create a custom tag rule.
     */
    post: operations["create_custom_rule_api_v1_custom_rules_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/custom-rules/{rule_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Custom Rule
     * @description Get a custom tag rule by ID.
     */
    get: operations["get_custom_rule_api_v1_custom_rules__rule_id__get"];
    /**
     * Update Custom Rule
     * @description Update a custom tag rule.
     */
    put: operations["update_custom_rule_api_v1_custom_rules__rule_id__put"];
    post?: never;
    /**
     * Delete Custom Rule
     * @description Delete a custom tag rule.
     */
    delete: operations["delete_custom_rule_api_v1_custom_rules__rule_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/custom-rules/test": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Run Rule Test
     * @description Test a rule against an existing scan (real execution via checkers).
     */
    post: operations["run_rule_test_api_v1_custom_rules_test_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/policy-sets": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Policy Sets
     * @description List accessible policy sets for the caller's organization (paginated).
     *
     *     ``limit`` is capped at 200; requests above that return 422 rather
     *     than silent downgrade.
     */
    get: operations["list_policy_sets_api_v1_policy_sets_get"];
    put?: never;
    /**
     * Create Policy Set
     * @description Create a policy set.
     */
    post: operations["create_policy_set_api_v1_policy_sets_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/policy-sets/{policy_set_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Policy Set
     * @description Get a policy set by ID.
     */
    get: operations["get_policy_set_api_v1_policy_sets__policy_set_id__get"];
    /**
     * Update Policy Set
     * @description Update a policy set.
     */
    put: operations["update_policy_set_api_v1_policy_sets__policy_set_id__put"];
    post?: never;
    /**
     * Delete Policy Set
     * @description Delete a policy set.
     */
    delete: operations["delete_policy_set_api_v1_policy_sets__policy_set_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/policy-sets/{policy_set_id}/request-approval": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Request Public Approval
     * @description Request public approval for a policy set.
     */
    post: operations["request_public_approval_api_v1_policy_sets__policy_set_id__request_approval_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/alerts": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Alerts
     * @description List alerts for the caller's organization with pagination + filters.
     *
     *     ``limit`` is capped at 200; requests above that return 422 rather
     *     than a silently downgraded response. Iterate through all results
     *     using ``page``/``limit`` and the returned ``total``/``pages``.
     *
     *     Note: ``offset`` was removed in favour of ``page`` — sending
     *     ``offset`` has no effect.
     */
    get: operations["list_alerts_api_v1_alerts_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/alerts/{alert_id}/status": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Update Alert Status
     * @description Update an alert's status.
     */
    patch: operations["update_alert_status_api_v1_alerts__alert_id__status_patch"];
    trace?: never;
  };
  "/api/v1/alerts/stats": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Alert Stats
     * @description Get alert statistics grouped by status.
     */
    get: operations["get_alert_stats_api_v1_alerts_stats_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/billing": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Billing Summary
     * @description Get billing summary for caller's organization.
     */
    get: operations["get_billing_summary_api_v1_billing_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/billing/usage": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Usage
     * @description List usage records for caller's organization.
     */
    get: operations["list_usage_api_v1_billing_usage_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/billing/usage/summary": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Usage Summary
     * @description Return a one-line aggregate of caller-org usage over the current period.
     */
    get: operations["get_usage_summary_api_v1_billing_usage_summary_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/billing/history": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Balance History
     * @description Return caller-org balance history (ledger rows) with filters + pagination.
     */
    get: operations["list_balance_history_api_v1_billing_history_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/webhooks": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Webhooks */
    get: operations["list_webhooks_api_v1_webhooks_get"];
    put?: never;
    /** Create Webhook */
    post: operations["create_webhook_api_v1_webhooks_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/webhooks/event-types": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Event Catalog */
    get: operations["list_event_catalog_api_v1_webhooks_event_types_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/webhooks/{endpoint_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get Webhook */
    get: operations["get_webhook_api_v1_webhooks__endpoint_id__get"];
    put?: never;
    post?: never;
    /** Delete Webhook */
    delete: operations["delete_webhook_api_v1_webhooks__endpoint_id__delete"];
    options?: never;
    head?: never;
    /** Update Webhook */
    patch: operations["update_webhook_api_v1_webhooks__endpoint_id__patch"];
    trace?: never;
  };
  "/api/v1/webhooks/{endpoint_id}/test": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Test Webhook */
    post: operations["test_webhook_api_v1_webhooks__endpoint_id__test_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/webhooks/{endpoint_id}/rotate-secret": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Rotate Webhook Secret */
    post: operations["rotate_webhook_secret_api_v1_webhooks__endpoint_id__rotate_secret_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/webhooks/{endpoint_id}/deliveries": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Delivery Attempts */
    get: operations["list_delivery_attempts_api_v1_webhooks__endpoint_id__deliveries_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/webhooks/deliveries/{attempt_id}/replay": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Replay Delivery */
    post: operations["replay_delivery_api_v1_webhooks_deliveries__attempt_id__replay_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/webhooks/{endpoint_id}/replay": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Bulk Replay */
    post: operations["bulk_replay_api_v1_webhooks__endpoint_id__replay_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/alert-notifications/destinations": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Destinations
     * @description List every destination owned by the caller's organization.
     */
    get: operations["list_destinations_api_v1_alert_notifications_destinations_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/alert-notifications/destinations/{destination_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Delete Destination
     * @description Delete one destination.
     */
    delete: operations["delete_destination_api_v1_alert_notifications_destinations__destination_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/alert-notifications/destinations/{destination_id}/version": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Set Destination Version
     * @description Switch the destination's report-link version (public vs internal).
     */
    patch: operations["set_destination_version_api_v1_alert_notifications_destinations__destination_id__version_patch"];
    trace?: never;
  };
  "/api/v1/alert-notifications/campaigns/{campaign_id}/overrides": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Campaign Overrides
     * @description Read the campaign's notification mode + override list.
     */
    get: operations["get_campaign_overrides_api_v1_alert_notifications_campaigns__campaign_id__overrides_get"];
    /**
     * Set Campaign Overrides
     * @description Replace the campaign's notification mode + override list.
     */
    put: operations["set_campaign_overrides_api_v1_alert_notifications_campaigns__campaign_id__overrides_put"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/invoices": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Invoices
     * @description List caller-org invoices with optional filters + pagination.
     */
    get: operations["list_invoices_api_v1_invoices_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/invoices/{invoice_id}/pdf": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Invoice Pdf
     * @description Return a time-limited signed URL for the invoice PDF (or ``ready=false``).
     */
    get: operations["get_invoice_pdf_api_v1_invoices__invoice_id__pdf_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/contact": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Submit a contact inquiry
     * @description Accept a contact-form submission from the public marketing site.
     *
     *     Returns ``200 OK`` with an opaque inquiry id on success and
     *     ``429 Too Many Requests`` when the same client IP submits more
     *     than the configured limit (default 5/hour).
     */
    post: operations["submit_contact_api_v1_contact_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/demo-inquiries": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Submit a Request-a-Demo inquiry
     * @description Accept a Request-a-Demo submission from the public marketing site.
     *
     *     Returns ``200 OK`` with an opaque inquiry id on success and
     *     ``429 Too Many Requests`` with code
     *     ``marketing.demo_inquiry_rate_limited`` when the same client IP
     *     submits more than the configured limit (default 5/hour). The UI
     *     branches on the ``code`` field to show a "wait a few minutes"
     *     line instead of a generic toast.
     */
    post: operations["submit_demo_inquiry_api_v1_demo_inquiries_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /**
     * AlertNotificationDestinationResponse
     * @description Public projection of one configured destination.
     */
    AlertNotificationDestinationResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Organization Id
       * Format: uuid
       */
      organization_id: string;
      /** Channel */
      channel: string;
      /** Name */
      name: string;
      /** Is Active */
      is_active: boolean;
      /** Is Default Target */
      is_default_target: boolean;
      version: components["schemas"]["AlertNotificationVersion"];
      /** Consecutive Failures */
      consecutive_failures: number;
      /** Last Delivery At */
      last_delivery_at: string | null;
      /** Last Delivery Status */
      last_delivery_status: number | null;
      /** Slack Workspace Id */
      slack_workspace_id: string | null;
      /** Slack Channel Id */
      slack_channel_id: string | null;
      /** Slack Channel Name */
      slack_channel_name: string | null;
      /** Telegram Chat Id */
      telegram_chat_id: number | null;
      /** Telegram Chat Title */
      telegram_chat_title: string | null;
      /** Telegram Chat Type */
      telegram_chat_type: string | null;
      /** Email Address */
      email_address: string | null;
      /** Included Label Keys */
      included_label_keys: string[];
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /**
       * Updated At
       * Format: date-time
       */
      updated_at: string;
    };
    /**
     * AlertNotificationVersion
     * @description Per-destination preference for the scan-report link in alert messages.
     *
     *     ``PUBLIC`` -> ``/public/scans/{id}`` (anonymous, no auth required).
     *     ``INTERNAL`` -> ``/scans/{id}`` (authenticated full report).
     *
     *     Default is ``PUBLIC`` to preserve the historical behaviour of every
     *     Slack/Telegram destination linking to the public report.
     * @enum {string}
     */
    AlertNotificationVersion: "public" | "internal";
    /**
     * AlertResponse
     * @description Alert returned by API endpoints.
     */
    AlertResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Scan Id
       * Format: uuid
       */
      scan_id: string;
      /**
       * Campaign Id
       * Format: uuid
       */
      campaign_id: string;
      /** Policy Set Id */
      policy_set_id: string | null;
      /** Violation Rule Id */
      violation_rule_id: string | null;
      /**
       * Organization Id
       * Format: uuid
       */
      organization_id: string;
      /** Tag Slug */
      tag_slug: string;
      /** Country Code */
      country_code: string;
      /** Status */
      status: string;
      /** Closed By */
      closed_by: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /** Updated At */
      updated_at: string | null;
      /** Scan Url */
      scan_url: string;
      /** Offer Url */
      offer_url: string;
      /** Tag Display Name */
      tag_display_name: string;
    };
    /**
     * AlertStatsResponse
     * @description Aggregated alert counts by status.
     */
    AlertStatsResponse: {
      /** Open */
      open: number;
      /** Acknowledged */
      acknowledged: number;
      /** Resolved */
      resolved: number;
      /** Dismissed */
      dismissed: number;
    };
    /**
     * AlertStatus
     * @description Lifecycle status of a policy-violation alert.
     * @enum {string}
     */
    AlertStatus: "open" | "acknowledged" | "resolved" | "dismissed";
    /**
     * ApiKeyCreatedResponse
     * @description One-time response with the full API key visible.
     */
    ApiKeyCreatedResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Key Prefix */
      key_prefix: string;
      /** Full Key */
      full_key: string;
      /** Name */
      name: string;
      /** Expires At */
      expires_at: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * ApiKeyResponse
     * @description API key metadata (full key is never shown after creation).
     */
    ApiKeyResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Key Prefix */
      key_prefix: string;
      /** Name */
      name: string;
      /** Expires At */
      expires_at: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * BalanceTransactionResponse
     * @description One ledger row as seen through the API.
     */
    BalanceTransactionResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Type */
      type: string;
      /** Amount Micros */
      amount_micros: number;
      /** Balance After Micros */
      balance_after_micros: number;
      /** Description */
      description: string;
      /** Reference Kind */
      reference_kind: string | null;
      /** Reference Id */
      reference_id: string | null;
      /** Actor User Id */
      actor_user_id: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * BalanceTransactionType
     * @description What kind of balance motion generated this ledger row.
     *
     *     The ledger is append-only. Every motion that changes
     *     ``balances.amount_micros`` MUST produce exactly one row of one of
     *     the variants below. Signed ``amount`` decides direction (positive
     *     credits the org, negative debits it).
     * @enum {string}
     */
    BalanceTransactionType:
      | "initial_balance"
      | "top_up_manual"
      | "usage_charge"
      | "subscription_renewal"
      | "subscription_upgrade"
      | "admin_adjustment"
      | "refund"
      | "invoice_settlement"
      | "crypto_top_up";
    /**
     * BillingSummaryResponse
     * @description Aggregated billing state for an organization.
     */
    BillingSummaryResponse: {
      /** Balance Micros */
      balance_micros: number;
      /** Plan Name */
      plan_name: string | null;
      /** Plan Id */
      plan_id: string | null;
      /** Checks Per Period */
      checks_per_period: number | null;
      /** Checks Used */
      checks_used: number | null;
      /** Period Start */
      period_start: string | null;
      /** Period End */
      period_end: string | null;
      /** Price Per Extra Check Micros */
      price_per_extra_check_micros: number | null;
      /**
       * Current Plan Is Custom
       * @default false
       */
      current_plan_is_custom: boolean;
      /**
       * Is Suspended
       * @default false
       */
      is_suspended: boolean;
      /** Scheduled Next Plan Id */
      scheduled_next_plan_id?: string | null;
      /** Scheduled Next Plan Name */
      scheduled_next_plan_name?: string | null;
      /** Scheduled Effective At */
      scheduled_effective_at?: string | null;
      /**
       * Can Create Scan
       * @default true
       */
      can_create_scan: boolean;
      block_reason?: components["schemas"]["BlockReason"] | null;
      /**
       * Billing Mode
       * @default prepaid
       */
      billing_mode: string;
      /**
       * Credit Limit Micros
       * @default 0
       */
      credit_limit_micros: number;
      /**
       * Effective Minimum Balance Micros
       * @default 0
       */
      effective_minimum_balance_micros: number;
    };
    /**
     * BlockReason
     * @description Why a scan admission decision came back ``allowed=False``.
     * @enum {string}
     */
    BlockReason: "no_subscription" | "suspended" | "insufficient_funds";
    /**
     * BulkCampaignFailure
     * @description One failed campaign inside a bulk group-action response.
     */
    BulkCampaignFailure: {
      /**
       * Campaign Id
       * Format: uuid
       */
      campaign_id: string;
      /** Error Code */
      error_code: string;
      /** Detail */
      detail: string;
    };
    /**
     * BulkReplayRequest
     * @description Range filter for bulk-replaying failed deliveries.
     */
    BulkReplayRequest: {
      /**
       * From Ts
       * Format: date-time
       */
      from_ts: string;
      /**
       * To Ts
       * Format: date-time
       */
      to_ts: string;
    };
    /**
     * BulkReplayResponse
     * @description How many rows were re-armed and how many were skipped.
     */
    BulkReplayResponse: {
      /** Replayed */
      replayed: number;
      /** Skipped */
      skipped: number;
    };
    /**
     * BulkScanRequest
     * @description Request body to create scans for a URL or ad tag across multiple countries.
     */
    BulkScanRequest: {
      /** Url */
      url?: string | null;
      /** Ad Tag */
      ad_tag?: string | null;
      /** Country Codes */
      country_codes: string[];
      /** Emulator Id */
      emulator_id: string;
      proxy?: components["schemas"]["ProxyTargetRequest"];
      /** Labels */
      labels?: {
        [key: string]: string;
      };
    };
    /**
     * CampaignGroupResponse
     * @description Campaign group info returned by the API.
     */
    CampaignGroupResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Is Default */
      is_default: boolean;
      /** Is Archived */
      is_archived: boolean;
      /** Schedule Paused */
      schedule_paused: boolean;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /** Campaign Count */
      campaign_count?: number | null;
    };
    /**
     * CampaignOverridesResponse
     * @description Read projection of a campaign's notification configuration.
     */
    CampaignOverridesResponse: {
      /**
       * Campaign Id
       * Format: uuid
       */
      campaign_id: string;
      /** Mode */
      mode: string;
      /** Destination Ids */
      destination_ids: string[];
    };
    /**
     * CampaignPickerItem
     * @description Minimal campaign info for dropdown / combobox consumers.
     *
     *     Intentionally omits heavy fields (schedule, proxy, labels) so the
     *     picker endpoint stays fast even when the caller searches across an
     *     org with thousands of campaigns.
     */
    CampaignPickerItem: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /**
       * Group Id
       * Format: uuid
       */
      group_id: string;
      /** Is Archived */
      is_archived: boolean;
    };
    /**
     * CampaignResponse
     * @description Campaign info returned by API.
     */
    CampaignResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /**
       * Campaign Type
       * @default url
       */
      campaign_type: string;
      /** Url */
      url: string;
      /** Ad Tag */
      ad_tag?: string | null;
      /** Country Codes */
      country_codes: string[];
      /**
       * Group Id
       * Format: uuid
       */
      group_id: string;
      emulator_selection: components["schemas"]["EmulatorSelectionResponse"];
      /**
       * Proxy Type
       * @default residential
       */
      proxy_type: string;
      /**
       * Proxy Region
       * @default
       */
      proxy_region: string;
      /**
       * Proxy City
       * @default
       */
      proxy_city: string;
      /**
       * Proxy Isp
       * @default
       */
      proxy_isp: string;
      /** Schedule Type */
      schedule_type?: string | null;
      /** Schedule Weekly */
      schedule_weekly?: {
        [key: string]: number[];
      } | null;
      /** Schedule Interval Seconds */
      schedule_interval_seconds?: number | null;
      /** Schedule Timezone */
      schedule_timezone?: string | null;
      /** Labels */
      labels?: {
        [key: string]: string;
      };
      /** Policy Set Id */
      policy_set_id?: string | null;
      /** Schedule Enabled */
      schedule_enabled: boolean;
      /** Is Archived */
      is_archived: boolean;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /** Last Run At */
      last_run_at?: string | null;
    };
    /**
     * CancelPendingResponse
     * @description Number of scans moved from pending to cancelled.
     */
    CancelPendingResponse: {
      /** Cancelled Count */
      cancelled_count: number;
    };
    /**
     * ContactInquiryAcknowledgement
     * @description Returned to the public site after a successful submission.
     *
     *     Deliberately minimal: an opaque id (so the public site can show
     *     a "your reference is ..." line if it wants) and a timestamp.
     *     Nothing about routing, queuing, or operator response — those are
     *     internal.
     */
    ContactInquiryAcknowledgement: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Received At
       * Format: date-time
       */
      received_at: string;
    };
    /**
     * CreateApiKeyRequest
     * @description Request body for API key creation.
     */
    CreateApiKeyRequest: {
      /** Name */
      name: string;
      /** Expires At */
      expires_at?: string | null;
    };
    /**
     * CreateCampaignGroupRequest
     * @description Request body to create a new campaign group.
     */
    CreateCampaignGroupRequest: {
      /** Name */
      name: string;
    };
    /**
     * CreateCampaignRequest
     * @description Request body to create a campaign.
     */
    CreateCampaignRequest: {
      /** Name */
      name: string;
      /**
       * Campaign Type
       * @default url
       */
      campaign_type: string;
      /** Url */
      url?: string | null;
      /** Ad Tag */
      ad_tag?: string | null;
      /** Country Codes */
      country_codes: string[];
      /** Group Id */
      group_id?: string | null;
      /** Emulator Categories */
      emulator_categories?: string[];
      /** Emulator Specific Ids */
      emulator_specific_ids?: string[];
      /**
       * Emulator Mode
       * @default random
       */
      emulator_mode: string;
      /**
       * Proxy Type
       * @default residential
       */
      proxy_type: string;
      /**
       * Proxy Region
       * @default
       */
      proxy_region: string;
      /**
       * Proxy City
       * @default
       */
      proxy_city: string;
      /**
       * Proxy Isp
       * @default
       */
      proxy_isp: string;
      /** Labels */
      labels?: {
        [key: string]: string;
      };
      /** Policy Set Id */
      policy_set_id?: string | null;
      /** Schedule Type */
      schedule_type?: string | null;
      /** Schedule Weekly */
      schedule_weekly?: {
        [key: string]: number[];
      } | null;
      /** Schedule Interval Seconds */
      schedule_interval_seconds?: number | null;
      /** Schedule Enabled */
      schedule_enabled?: boolean | null;
      /** Schedule Timezone */
      schedule_timezone?: string | null;
    };
    /**
     * CreateCustomRoleRequest
     * @description Request body for custom role creation.
     */
    CreateCustomRoleRequest: {
      /** Name */
      name: string;
      /** Permissions */
      permissions: string[];
    };
    /**
     * CreateCustomRuleRequest
     * @description Request body for POST /custom-rules.
     */
    CreateCustomRuleRequest: {
      /** Name */
      name: string;
      /**
       * Tag Slug
       * @default
       */
      tag_slug: string;
      /** Rule Type */
      rule_type: string;
      /** Config */
      config: {
        [key: string]: unknown;
      };
      /**
       * Target
       * @default page
       */
      target: string;
    };
    /**
     * CreatePolicySetRequest
     * @description Request body for POST /policy-sets.
     */
    CreatePolicySetRequest: {
      /** Name */
      name: string;
      /**
       * Description
       * @default
       */
      description: string;
      /** Entries */
      entries: components["schemas"]["PolicyEntryRequest"][];
    };
    /**
     * CreateScanRequest
     * @description Request body to create a single scan.
     */
    CreateScanRequest: {
      /** Url */
      url?: string | null;
      /** Ad Tag */
      ad_tag?: string | null;
      /** Country Code */
      country_code: string;
      /** Emulator Id */
      emulator_id: string;
      proxy?: components["schemas"]["ProxyTargetRequest"];
      /** Labels */
      labels?: {
        [key: string]: string;
      };
      /** Campaign Id */
      campaign_id?: string | null;
      /** Run Id */
      run_id?: string | null;
    };
    /**
     * CreateWebhookRequest
     * @description Create-webhook request body.
     */
    CreateWebhookRequest: {
      /** Url */
      url: string;
      /**
       * Description
       * @default
       */
      description: string;
      /** Event Types */
      event_types?: string[];
      /** Campaign Ids */
      campaign_ids?: string[] | null;
    };
    /**
     * CustomRuleResponse
     * @description Custom tag rule returned by API.
     */
    CustomRuleResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Organization Id
       * Format: uuid
       */
      organization_id: string;
      /** Name */
      name: string;
      /** Tag Slug */
      tag_slug: string;
      /** Rule Type */
      rule_type: string;
      /** Config */
      config: {
        [key: string]: unknown;
      };
      /** Target */
      target: string;
      /** Is Active */
      is_active: boolean;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * DeliveryAttemptResponse
     * @description One row of the partner-facing delivery log.
     */
    DeliveryAttemptResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Event Id
       * Format: uuid
       */
      event_id: string;
      /** Event Type */
      event_type: string;
      /** Response Status */
      response_status: number | null;
      /** Response Body */
      response_body: string | null;
      /** Success */
      success: boolean;
      /** Attempt Number */
      attempt_number: number;
      /** Error Code */
      error_code: string | null;
      /** Elapsed Ms */
      elapsed_ms: number | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * DemoInquiryAcknowledgement
     * @description Returned to the public site after a successful submission.
     *
     *     Mirror of :class:`ContactInquiryAcknowledgement`: an opaque id
     *     and a timestamp, nothing about internal routing. The public site
     *     swaps the form for the HubSpot Meeting Scheduler embed on receipt.
     */
    DemoInquiryAcknowledgement: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Received At
       * Format: date-time
       */
      received_at: string;
    };
    /**
     * EmulatorResponse
     * @description Single emulator in the catalog.
     */
    EmulatorResponse: {
      /** Id */
      id: string;
      /** Display Name */
      display_name: string;
      /** Category */
      category: string;
      /** Browser */
      browser: string;
    };
    /**
     * EmulatorSelectionResponse
     * @description Embedded emulator selection in campaign responses.
     */
    EmulatorSelectionResponse: {
      /** Categories */
      categories: string[];
      /** Specific Ids */
      specific_ids: string[];
      /** Mode */
      mode: string;
    };
    /**
     * EndpointHealthResponse
     * @description Wire representation of :class:`EndpointHealth`.
     */
    EndpointHealthResponse: {
      /** Consecutive Failures */
      consecutive_failures: number;
      /** Last Delivery At */
      last_delivery_at: string | null;
      /** Last Delivery Status */
      last_delivery_status: number | null;
      /** Success Rate 7D */
      success_rate_7d: number;
    };
    /**
     * EventCatalogEntryResponse
     * @description Wire shape of a single catalog entry.
     */
    EventCatalogEntryResponse: {
      /** Event Type */
      event_type: string;
      /** Description */
      description: string;
      /** Sample Payload */
      sample_payload: {
        [key: string]: unknown;
      };
    };
    /**
     * EventCatalogResponse
     * @description Entire static catalog; drives the UI event-type checkboxes.
     */
    EventCatalogResponse: {
      /** Entries */
      entries: components["schemas"]["EventCatalogEntryResponse"][];
    };
    /**
     * GeoResponse
     * @description Public representation of a geographic configuration.
     */
    GeoResponse: {
      /** Country Code */
      country_code: string;
      /** Name */
      name: string;
      /** Region */
      region: string;
      /** Tier */
      tier: string;
    };
    /**
     * GroupActionResponse
     * @description Bulk-action summary for cancel/run/archive group operations.
     *
     *     ``failures`` aggregates per-campaign errors so a partial batch (e.g.
     *     5 of 7 runs started, 2 blocked by ``billing.insufficient_funds``)
     *     surfaces to the UI instead of aborting the whole request with a
     *     single HTTP error code.
     */
    GroupActionResponse: {
      /**
       * Group Id
       * Format: uuid
       */
      group_id: string;
      /** Affected Campaigns */
      affected_campaigns: number;
      /**
       * Cancelled Count
       * @default 0
       */
      cancelled_count: number;
      /** Run Ids */
      run_ids?: string[];
      /** Failures */
      failures?: components["schemas"]["BulkCampaignFailure"][];
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: components["schemas"]["ValidationError"][];
    };
    /**
     * IabCategoryResponse
     * @description IAB Content Taxonomy category tiers.
     */
    IabCategoryResponse: {
      /** Tier1 */
      tier1: string;
      /** Tier2 */
      tier2?: string | null;
      /** Tier3 */
      tier3?: string | null;
      /** Tier4 */
      tier4?: string | null;
    };
    /**
     * InviteUserRequest
     * @description Request body for user invitation.
     *
     *     Legacy IANA timezone aliases are normalised to canonical names by
     *     :data:`OptionalTimezone` so the invitee row in ``users`` always
     *     holds a name that ``ZoneInfo`` accepts.
     */
    InviteUserRequest: {
      /** Email */
      email: string;
      /**
       * Name
       * @default
       */
      name: string;
      /**
       * Role Id
       * Format: uuid
       */
      role_id: string;
      /** Timezone */
      timezone?: string | null;
    };
    /**
     * InvoicePdfUrlResponse
     * @description Time-limited download link, or ``null`` when the PDF is not yet rendered.
     */
    InvoicePdfUrlResponse: {
      /** Url */
      url: string | null;
      /** Ready */
      ready: boolean;
    };
    /**
     * InvoiceResponse
     * @description Projection of an :class:`Invoice` for the API layer.
     */
    InvoiceResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Number */
      number: string;
      /**
       * Organization Id
       * Format: uuid
       */
      organization_id: string;
      /** Type */
      type: string;
      /** Status */
      status: string;
      /** Total Micros */
      total_micros: number;
      /** Currency */
      currency: string;
      /** Period Start */
      period_start: string | null;
      /** Period End */
      period_end: string | null;
      /** Issued At */
      issued_at: string | null;
      /** Paid At */
      paid_at: string | null;
      /** Voided At */
      voided_at: string | null;
      /** Has Pdf */
      has_pdf: boolean;
      /** Description */
      description: string;
      /** Payment Method */
      payment_method: string;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * InvoiceStatus
     * @description Lifecycle states of an :class:`Invoice`.
     *
     *     Transitions:
     *     - ``DRAFT`` → ``ISSUED`` (on issuance; PDF render follows)
     *     - ``ISSUED`` → ``PAID`` (on admin payment confirmation or gateway webhook)
     *     - ``ISSUED`` → ``VOIDED`` (admin void with reason)
     *     - ``ISSUED`` → ``OVERDUE`` (scheduled: past due-date, still unpaid)
     * @enum {string}
     */
    InvoiceStatus: "draft" | "issued" | "paid" | "voided" | "overdue";
    /**
     * InvoiceType
     * @description Kind of invoice. Drives numbering sequence prefix + workflow.
     *
     *     * ``PROFORMA`` — self-service document a client uses to pay by
     *       bank transfer. On confirmation → balance top-up via ledger.
     *     * ``FINAL`` — end-of-period statement. For PREPAID orgs it is
     *       informational (status=PAID on issue). For POSTPAID orgs it is
     *       the bill and remains ISSUED until payment confirmation.
     * @enum {string}
     */
    InvoiceType: "proforma" | "final";
    /**
     * LabelDefinitionItem
     * @description A single label definition within the update request.
     */
    LabelDefinitionItem: {
      /** Key */
      key: string;
      /** Display Name */
      display_name: string;
      /**
       * Auto Extract
       * @default false
       */
      auto_extract: boolean;
    };
    /**
     * LabelDefinitionResponse
     * @description Label definition info returned to clients.
     */
    LabelDefinitionResponse: {
      /** Key */
      key: string;
      /** Display Name */
      display_name: string;
      /** Position */
      position: number;
      /** Auto Extract */
      auto_extract: boolean;
    };
    /**
     * LandingResponse
     * @description One landing tab of an ad-tag scan, exposed via ``ScanResponse.landings``.
     *
     *     Multi-tab landing capture: a single ad creative click can open
     *     multiple browser tabs (offer + tracking pixels + secondary popups);
     *     each becomes its own ``LandingResponse``. ``ord=0`` is the primary
     *     landing whose URL/screenshot are also mirrored into the legacy
     *     scalar fields on ``ScanResponse`` for backward compatibility.
     */
    LandingResponse: {
      /** Ord */
      ord: number;
      /**
       * Opener Url
       * @default
       */
      opener_url: string;
      /**
       * Final Url
       * @default
       */
      final_url: string;
      /**
       * Offer Url
       * @default
       */
      offer_url: string;
      /**
       * Page Title
       * @default
       */
      page_title: string;
      /**
       * Screenshot Url
       * @default
       */
      screenshot_url: string;
      /** Redirect Chain */
      redirect_chain?: components["schemas"]["RedirectHopResponse"][];
      /**
       * Elapsed Ms
       * @default 0
       */
      elapsed_ms: number;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * LinkedRuleResponse
     * @description Minimal info about a custom rule that produces a given tag.
     */
    LinkedRuleResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Rule Type */
      rule_type: string;
      /** Target */
      target: string;
      /** Is Active */
      is_active: boolean;
    };
    /**
     * OrgResponse
     * @description Organization details returned to clients.
     */
    OrgResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /**
       * Owner Id
       * Format: uuid
       */
      owner_id: string;
      /** Is Active */
      is_active: boolean;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /** PaginatedResponse[AlertResponse] */
    PaginatedResponse_AlertResponse_: {
      /** Items */
      items: components["schemas"]["AlertResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[BalanceTransactionResponse] */
    PaginatedResponse_BalanceTransactionResponse_: {
      /** Items */
      items: components["schemas"]["BalanceTransactionResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[CampaignResponse] */
    PaginatedResponse_CampaignResponse_: {
      /** Items */
      items: components["schemas"]["CampaignResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[CustomRuleResponse] */
    PaginatedResponse_CustomRuleResponse_: {
      /** Items */
      items: components["schemas"]["CustomRuleResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[DeliveryAttemptResponse] */
    PaginatedResponse_DeliveryAttemptResponse_: {
      /** Items */
      items: components["schemas"]["DeliveryAttemptResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[InvoiceResponse] */
    PaginatedResponse_InvoiceResponse_: {
      /** Items */
      items: components["schemas"]["InvoiceResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[PolicySetListItem] */
    PaginatedResponse_PolicySetListItem_: {
      /** Items */
      items: components["schemas"]["PolicySetListItem"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[RunResponse] */
    PaginatedResponse_RunResponse_: {
      /** Items */
      items: components["schemas"]["RunResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[ScanBriefResponse] */
    PaginatedResponse_ScanBriefResponse_: {
      /** Items */
      items: components["schemas"]["ScanBriefResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[ScanTileResponse] */
    PaginatedResponse_ScanTileResponse_: {
      /** Items */
      items: components["schemas"]["ScanTileResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /** PaginatedResponse[UsageResponse] */
    PaginatedResponse_UsageResponse_: {
      /** Items */
      items: components["schemas"]["UsageResponse"][];
      /** Total */
      total: number;
      /** Page */
      page: number;
      /** Limit */
      limit: number;
      /** Pages */
      pages: number;
    };
    /**
     * PolicyEntryRequest
     * @description A single entry in a policy set creation/update request.
     */
    PolicyEntryRequest: {
      /** Tag Slug */
      tag_slug: string;
      /** Country Codes */
      country_codes?: string[];
    };
    /**
     * PolicyEntryResponse
     * @description A single entry in a policy set response.
     */
    PolicyEntryResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Tag Slug */
      tag_slug: string;
      /** Country Codes */
      country_codes: string[];
    };
    /**
     * PolicySetListItem
     * @description Policy set in list responses (without entries).
     */
    PolicySetListItem: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Description */
      description: string;
      /**
       * Organization Id
       * Format: uuid
       */
      organization_id: string;
      /** Visibility */
      visibility: string;
      /** Is Approved */
      is_approved: boolean;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * PolicySetResponse
     * @description Policy set returned by API (with entries).
     */
    PolicySetResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Description */
      description: string;
      /**
       * Organization Id
       * Format: uuid
       */
      organization_id: string;
      /** Visibility */
      visibility: string;
      /** Is Approved */
      is_approved: boolean;
      /** Entries */
      entries: components["schemas"]["PolicyEntryResponse"][];
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * PreferredContactChannel
     * @description Where the prospect wants the sales team to reach out.
     *
     *     Values are the public wire format (the form select submits them
     *     as-is and they land in the ``demo_inquiries.preferred_channel``
     *     column). Adding new entries is additive; renames need a migration
     *     + back-fill because the column stores the string.
     * @enum {string}
     */
    PreferredContactChannel: "telegram" | "whatsapp" | "email";
    /**
     * ProxyTargetRequest
     * @description Proxy targeting parameters for a scan.
     */
    ProxyTargetRequest: {
      /**
       * Proxy Type
       * @default residential
       */
      proxy_type: string;
      /**
       * Region
       * @default
       */
      region: string;
      /**
       * City
       * @default
       */
      city: string;
      /**
       * Isp
       * @default
       */
      isp: string;
    };
    /**
     * ProxyTargetResponse
     * @description Proxy targeting info in a scan response.
     */
    ProxyTargetResponse: {
      /** Proxy Type */
      proxy_type: string;
      /**
       * Region
       * @default
       */
      region: string;
      /**
       * City
       * @default
       */
      city: string;
      /**
       * Isp
       * @default
       */
      isp: string;
    };
    /**
     * RecheckRequest
     * @description Request body for POST /scans/recheck.
     */
    RecheckRequest: {
      /**
       * Scope Type
       * @enum {string}
       */
      scope_type: "last_n" | "hours";
      /** Scope Value */
      scope_value: number;
    };
    /**
     * RecheckResponse
     * @description Result of a recheck-scans operation.
     */
    RecheckResponse: {
      /** Queued Count */
      queued_count: number;
    };
    /**
     * RedirectHopResponse
     * @description One main-frame redirect step with nested sub-request tree.
     */
    RedirectHopResponse: {
      /** Url */
      url: string;
      /** Status Code */
      status_code: number;
      /** Content Type */
      content_type: string;
      /** Body Size */
      body_size: number;
      /** Timestamp Ms */
      timestamp_ms: number;
      /** Redirected From */
      redirected_from: string;
      /** Sub Requests */
      sub_requests: components["schemas"]["SubRequestResponse"][];
    };
    /**
     * RoleResponse
     * @description Role details with associated permission codenames.
     */
    RoleResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Scope */
      scope: string;
      /** Is System */
      is_system: boolean;
      /** Permissions */
      permissions: string[];
    };
    /**
     * RuleTestRequest
     * @description Request body for POST /custom-rules/test.
     */
    RuleTestRequest: {
      /**
       * Scan Id
       * Format: uuid
       */
      scan_id: string;
      /** Rule Type */
      rule_type: string;
      /** Config */
      config: {
        [key: string]: unknown;
      };
      /**
       * Target
       * @default page
       */
      target: string;
    };
    /**
     * RuleTestResponse
     * @description Response from POST /custom-rules/test.
     *
     *     ``llm_failed`` is True when the LLM provider could not complete the
     *     evaluation (API error, invalid response). The UI surfaces this as a
     *     warning instead of showing a misleading "No match".
     *
     *     ``llm_call_id`` / ``llm_prompt_url`` / ``llm_response_url`` are
     *     populated only when an LLM-based rule actually ran and the worker
     *     persisted the call's telemetry. The UI renders collapsible prompt
     *     and response sections from the two same-origin URLs (served by
     *     ``/api/internal/llm/calls/{id}/...``); non-LLM rule types and
     *     runs where telemetry didn't land leave them empty/None so the
     *     sections stay hidden.
     */
    RuleTestResponse: {
      /** Matched */
      matched: boolean;
      /** Tags */
      tags: components["schemas"]["RuleTestTagResult"][];
      /** Elapsed Ms */
      elapsed_ms: number;
      /**
       * Llm Failed
       * @default false
       */
      llm_failed: boolean;
      /** Llm Call Id */
      llm_call_id?: string | null;
      /**
       * Llm Prompt Url
       * @default
       */
      llm_prompt_url: string;
      /**
       * Llm Response Url
       * @default
       */
      llm_response_url: string;
    };
    /**
     * RuleTestTagResult
     * @description A single tag detection from the test.
     */
    RuleTestTagResult: {
      /** Tag Slug */
      tag_slug: string;
      /**
       * Detail
       * @default
       */
      detail: string;
    };
    /**
     * RunResponse
     * @description Run info with progress counters.
     */
    RunResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Campaign Id
       * Format: uuid
       */
      campaign_id: string;
      /** Label */
      label: string;
      /** Total */
      total: number;
      /** Completed */
      completed: number;
      /** Failed */
      failed: number;
      /** Partial */
      partial: number;
      /** Cancelled */
      cancelled: number;
      source: components["schemas"]["RunSource"];
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * RunSource
     * @description Where the run was initiated from.
     *
     *     ``UI`` — explicit ``POST /campaigns/{id}/run`` from the dashboard.
     *     ``API`` — auto-created bucket for ``POST /api/v1/scans`` requests that
     *     carry a ``campaign_id`` but no ``run_id``. One API run per
     *     (campaign, organization, UTC-day).
     * @enum {string}
     */
    RunSource: "ui" | "api";
    /**
     * ScanBriefResponse
     * @description Brief scan info for list views.
     *
     *     Ad-tag scans surface as ``is_ad_tag=True`` with empty ``url``; the
     *     UI then shows ``campaign_name`` (and ``offer_url`` if present) in the
     *     URL column instead of the empty input URL. The HTML creative is NOT
     *     leaked in the list response — only the boolean flag.
     */
    ScanBriefResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Url */
      url: string;
      /** Country Code */
      country_code: string;
      /**
       * Proxy Type
       * @default residential
       */
      proxy_type: string;
      status: components["schemas"]["ScanStatus"];
      /** Offer Url */
      offer_url: string;
      /**
       * Screenshot Url
       * @default
       */
      screenshot_url: string;
      /** Labels */
      labels?: {
        [key: string]: string;
      };
      classification?: components["schemas"]["ScanClassificationResponse"] | null;
      /** Elapsed Ms */
      elapsed_ms: number;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /** Campaign Id */
      campaign_id?: string | null;
      /** Campaign Name */
      campaign_name?: string | null;
      /**
       * Is Ad Tag
       * @default false
       */
      is_ad_tag: boolean;
    };
    /**
     * ScanClassificationResponse
     * @description Classification result for a scan — IAB categories + brand.
     */
    ScanClassificationResponse: {
      /** Brand */
      brand?: string | null;
      iab_v2?: components["schemas"]["IabCategoryResponse"] | null;
      iab_v3?: components["schemas"]["IabCategoryResponse"] | null;
    };
    /**
     * ScanResponse
     * @description Full scan detail returned by GET /scans/:id.
     */
    ScanResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Url */
      url: string;
      /** Country Code */
      country_code: string;
      /** Emulator Id */
      emulator_id: string;
      status: components["schemas"]["ScanStatus"];
      /** Offer Url */
      offer_url: string;
      /** Redirect Chain */
      redirect_chain: components["schemas"]["RedirectHopResponse"][];
      /**
       * Screenshot Url
       * @default
       */
      screenshot_url: string;
      /** Ad Tag */
      ad_tag?: string | null;
      /**
       * Creative Screenshot Url
       * @default
       */
      creative_screenshot_url: string;
      /**
       * Creative Width
       * @default 0
       */
      creative_width: number;
      /**
       * Creative Height
       * @default 0
       */
      creative_height: number;
      proxy?: components["schemas"]["ProxyTargetResponse"] | null;
      /** Page Title */
      page_title: string;
      /** Elapsed Ms */
      elapsed_ms: number;
      /** Error */
      error: string;
      /** Labels */
      labels?: {
        [key: string]: string;
      };
      classification?: components["schemas"]["ScanClassificationResponse"] | null;
      /** Campaign Id */
      campaign_id?: string | null;
      /** Campaign Name */
      campaign_name?: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /** Completed At */
      completed_at: string | null;
      /** Landings */
      landings?: components["schemas"]["LandingResponse"][];
    };
    /**
     * ScanStatus
     * @description Status of a scan through its lifecycle.
     *
     *     Ordered: pending(0) → running(1) → crawled(2) → checking(3) →
     *     checking_async(4) → terminal(5). Forward-only transitions enforced by
     *     advance_status() in the DB (see status_order() Postgres function).
     *
     *     ``CHECKING_ASYNC`` means all inline parts (regexp + domain checks) have
     *     been applied and we are waiting only on async parts (LLM batch today,
     *     SafeBrowsing / VirusTotal tomorrow). UI can show partial tags + alerts
     *     at this stage; only classification is still pending.
     * @enum {string}
     */
    ScanStatus:
      | "pending"
      | "running"
      | "crawled"
      | "checking"
      | "checking_async"
      | "completed"
      | "partial"
      | "failed"
      | "cancelled";
    /**
     * ScanTagResponse
     * @description A single tag applied to a scan.
     */
    ScanTagResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Scan Id
       * Format: uuid
       */
      scan_id: string;
      /** Tag Slug */
      tag_slug: string;
      /** Detail */
      detail: string;
      /**
       * Url
       * @default
       */
      url: string;
      /**
       * Display Name
       * @default
       */
      display_name: string;
      /**
       * Category
       * @default
       */
      category: string;
      /**
       * Severity
       * @default
       */
      severity: string;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * ScanTileResponse
     * @description Lightweight scan data for tile grid display.
     */
    ScanTileResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Country Code */
      country_code: string;
      /** Status */
      status: string;
      /**
       * Offer Url
       * @default
       */
      offer_url: string;
      /**
       * Screenshot Url
       * @default
       */
      screenshot_url: string;
      /**
       * Elapsed Ms
       * @default 0
       */
      elapsed_ms: number;
      /**
       * Error
       * @default
       */
      error: string;
    };
    /**
     * SetCampaignOverridesRequest
     * @description Persist a campaign's notification mode + override list atomically.
     */
    SetCampaignOverridesRequest: {
      /** Mode */
      mode: string;
      /**
       * Destination Ids
       * @default []
       */
      destination_ids: string[];
    };
    /**
     * SetDestinationVersionRequest
     * @description Body for ``PATCH /api/internal/alert-notifications/destinations/{id}/version``.
     */
    SetDestinationVersionRequest: {
      version: components["schemas"]["AlertNotificationVersion"];
    };
    /**
     * SubRequestResponse
     * @description One sub-request node with recursive children (initiator tree).
     */
    SubRequestResponse: {
      /** Url */
      url: string;
      /** Resource Type */
      resource_type: string;
      /** Status Code */
      status_code: number;
      /** Content Type */
      content_type: string;
      /** Body Size */
      body_size: number;
      /** Timestamp Ms */
      timestamp_ms: number;
      /** Children */
      children?: components["schemas"]["SubRequestResponse"][];
    };
    /**
     * SubmitContactInquiryRequest
     * @description Body of ``POST /api/v1/contact``.
     *
     *     Minimum-viable contact form. ``source`` is optional (where the
     *     visitor was on the public site when they submitted) — useful for
     *     routing inquiries to the right team. Field length caps protect
     *     against megabyte-spam payloads; pydantic validates them on
     *     request parse, so the use case never sees over-long input.
     */
    SubmitContactInquiryRequest: {
      /** Name */
      name: string;
      /**
       * Email
       * Format: email
       */
      email: string;
      /** Message */
      message: string;
      /**
       * Source
       * @default
       */
      source: string;
    };
    /**
     * SubmitDemoInquiryRequest
     * @description Body of ``POST /api/v1/demo-inquiries``.
     *
     *     Sibling of :class:`SubmitContactInquiryRequest` with the
     *     sales-qualified field set per
     *     `https://kaminari.click/request <https://kaminari.click/request>`_
     *     convention. Pydantic enforces:
     *
     *     * Length caps on every text field (megabyte-spam guard).
     *     * ``EmailStr`` on ``company_email`` (RFC-5322-ish + DNS-free
     *       syntactic validation).
     *     * ``PreferredContactChannel`` membership on ``preferred_channel``
     *       (invalid value → 422 automatically; no manual coercion needed).
     *     * ``privacy_accepted=True`` is hard-required by a validator —
     *       a ``False`` value returns 422 with a clear message, never a 500.
     */
    SubmitDemoInquiryRequest: {
      /** First Name */
      first_name: string;
      /** Last Name */
      last_name: string;
      /**
       * Company Email
       * Format: email
       */
      company_email: string;
      /** Company Name */
      company_name: string;
      preferred_channel: components["schemas"]["PreferredContactChannel"];
      /**
       * Comment
       * @default
       */
      comment: string;
      /** Privacy Accepted */
      privacy_accepted: boolean;
      /**
       * Source
       * @default
       */
      source: string;
    };
    /**
     * TagDefinitionDetailResponse
     * @description Tag definition with full list of linked custom rules.
     */
    TagDefinitionDetailResponse: {
      /** Slug */
      slug: string;
      /** Category */
      category: string;
      /** Source */
      source: string;
      /** Display Name */
      display_name: string;
      /** Description */
      description: string;
      /** Is System */
      is_system: boolean;
      /** Organization Id */
      organization_id: string | null;
      /** Show In Public Report */
      show_in_public_report: boolean;
      /** Severity */
      severity: string;
      /** Scans Count */
      scans_count: number;
      /** Rules Count */
      rules_count: number;
      /** Linked Rules */
      linked_rules?: components["schemas"]["LinkedRuleResponse"][];
    };
    /**
     * TagDefinitionWithStatsResponse
     * @description Tag definition enriched with scans and rules counts.
     */
    TagDefinitionWithStatsResponse: {
      /** Slug */
      slug: string;
      /** Category */
      category: string;
      /** Source */
      source: string;
      /** Display Name */
      display_name: string;
      /** Description */
      description: string;
      /** Is System */
      is_system: boolean;
      /** Organization Id */
      organization_id: string | null;
      /** Show In Public Report */
      show_in_public_report: boolean;
      /** Severity */
      severity: string;
      /** Scans Count */
      scans_count: number;
      /** Rules Count */
      rules_count: number;
    };
    /**
     * TagSeverity
     * @description Logical severity for a tag definition.
     *
     *     Independent of category/source — captures how serious the signal is.
     *
     *     HIGH: confirmed malicious / hard block (red badge).
     *     MEDIUM: suspicious / warning (yellow badge).
     *     LOW: informational signal, content classification, soft behaviour
     *     flag (blue/grey badge). Default for new custom tags.
     * @enum {string}
     */
    TagSeverity: "high" | "medium" | "low";
    /**
     * TestWebhookRequest
     * @description Which event type's sample payload to send.
     */
    TestWebhookRequest: {
      /** Event Type */
      event_type: string;
    };
    /**
     * TestWebhookResponse
     * @description Synthetic delivery result for the partner's UI.
     */
    TestWebhookResponse: {
      /** Success */
      success: boolean;
      /** Response Status */
      response_status: number | null;
      /** Elapsed Ms */
      elapsed_ms: number;
      /** Error Code */
      error_code: string | null;
      /** Response Body */
      response_body: string;
    };
    /**
     * UpdateAlertStatusRequest
     * @description Request body for PATCH /alerts/{id}/status.
     *
     *     Pydantic parses ``status`` into AlertStatus at the boundary (422 on invalid).
     */
    UpdateAlertStatusRequest: {
      status: components["schemas"]["AlertStatus"];
    };
    /**
     * UpdateCampaignGroupRequest
     * @description Request body to update campaign-group fields. Rename only for now.
     */
    UpdateCampaignGroupRequest: {
      /** Name */
      name?: string | null;
    };
    /**
     * UpdateCampaignRequest
     * @description Request body to update campaign fields. All fields optional.
     */
    UpdateCampaignRequest: {
      /** Name */
      name?: string | null;
      /** Url */
      url?: string | null;
      /** Ad Tag */
      ad_tag?: string | null;
      /** Country Codes */
      country_codes?: string[] | null;
      /** Group Id */
      group_id?: string | null;
      /** Emulator Categories */
      emulator_categories?: string[] | null;
      /** Emulator Specific Ids */
      emulator_specific_ids?: string[] | null;
      /** Emulator Mode */
      emulator_mode?: string | null;
      /** Proxy Type */
      proxy_type?: string | null;
      /** Proxy Region */
      proxy_region?: string | null;
      /** Proxy City */
      proxy_city?: string | null;
      /** Proxy Isp */
      proxy_isp?: string | null;
      /** Labels */
      labels?: {
        [key: string]: string;
      } | null;
      /** Policy Set Id */
      policy_set_id?: string | null;
      /** Schedule Type */
      schedule_type?: string | null;
      /** Schedule Weekly */
      schedule_weekly?: {
        [key: string]: number[];
      } | null;
      /** Schedule Interval Seconds */
      schedule_interval_seconds?: number | null;
      /** Schedule Enabled */
      schedule_enabled?: boolean | null;
      /** Schedule Timezone */
      schedule_timezone?: string | null;
    };
    /**
     * UpdateCustomRuleRequest
     * @description Request body for PUT /custom-rules/{id}. All fields optional.
     */
    UpdateCustomRuleRequest: {
      /** Name */
      name?: string | null;
      /** Tag Slug */
      tag_slug?: string | null;
      /** Config */
      config?: {
        [key: string]: unknown;
      } | null;
      /** Target */
      target?: string | null;
      /** Is Active */
      is_active?: boolean | null;
    };
    /**
     * UpdateLabelDefinitionsRequest
     * @description Request body to replace all label definitions for an organization.
     */
    UpdateLabelDefinitionsRequest: {
      /** Labels */
      labels: components["schemas"]["LabelDefinitionItem"][];
    };
    /**
     * UpdateOrgRequest
     * @description Request body for organization update.
     */
    UpdateOrgRequest: {
      /** Name */
      name?: string | null;
    };
    /**
     * UpdatePolicySetRequest
     * @description Request body for PUT /policy-sets/{id}.
     */
    UpdatePolicySetRequest: {
      /** Name */
      name: string;
      /**
       * Description
       * @default
       */
      description: string;
      /** Entries */
      entries: components["schemas"]["PolicyEntryRequest"][];
    };
    /**
     * UpdateTagDefinitionRequest
     * @description Request body for PATCH /tag-definitions/{slug}.
     */
    UpdateTagDefinitionRequest: {
      /** Display Name */
      display_name?: string | null;
      /** Description */
      description?: string | null;
      /** Show In Public Report */
      show_in_public_report?: boolean | null;
      severity?: components["schemas"]["TagSeverity"] | null;
    };
    /**
     * UpdateUserRoleRequest
     * @description Request body for user role update.
     */
    UpdateUserRoleRequest: {
      /**
       * Role Id
       * Format: uuid
       */
      role_id: string;
    };
    /**
     * UpdateWebhookRequest
     * @description Partial update for a webhook endpoint.
     *
     *     Fields set to ``None`` are left untouched; explicit ``False`` on
     *     ``is_active`` pauses the endpoint without deletion.
     */
    UpdateWebhookRequest: {
      /** Url */
      url?: string | null;
      /** Description */
      description?: string | null;
      /** Event Types */
      event_types?: string[] | null;
      /** Campaign Ids */
      campaign_ids?: string[] | null;
      /**
       * Clear Campaign Ids
       * @default false
       */
      clear_campaign_ids: boolean;
      /** Is Active */
      is_active?: boolean | null;
    };
    /**
     * UsagePeriodSummaryResponse
     * @description One-line aggregate of usage events in the window (`[start, end)`).
     */
    UsagePeriodSummaryResponse: {
      /**
       * Period Start
       * Format: date-time
       */
      period_start: string;
      /**
       * Period End
       * Format: date-time
       */
      period_end: string;
      /** Checks */
      checks: number;
      /** Rechecks */
      rechecks: number;
      /** Within Plan */
      within_plan: number;
      /** Overage */
      overage: number;
      /** Charged Micros */
      charged_micros: number;
    };
    /**
     * UsageResponse
     * @description Single usage record in API response.
     */
    UsageResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /**
       * Scan Id
       * Format: uuid
       */
      scan_id: string;
      /** Charged Micros */
      charged_micros: number;
      /** Balance After Micros */
      balance_after_micros: number;
      /** Within Plan */
      within_plan: boolean;
      /** Event Type */
      event_type: string;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /**
     * UserResponse
     * @description User details returned to clients.
     */
    UserResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Email */
      email: string;
      /** Name */
      name: string;
      /** Role Name */
      role_name: string;
      /** Is Active */
      is_active: boolean;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
    /** ValidationError */
    ValidationError: {
      /** Location */
      loc: (string | number)[];
      /** Message */
      msg: string;
      /** Error Type */
      type: string;
      /** Input */
      input?: unknown;
      /** Context */
      ctx?: Record<string, never>;
    };
    /**
     * VisibilityType
     * @description Controls who can see and use a policy set.
     * @enum {string}
     */
    VisibilityType: "private" | "public";
    /**
     * WebhookCreatedResponse
     * @description Create / rotate response carrying the cleartext signing secret.
     *
     *     The caller MUST persist ``secret`` on their side — we never return
     *     it again. Subsequent ``GET`` requests return only :class:`WebhookResponse`.
     */
    WebhookCreatedResponse: {
      webhook: components["schemas"]["WebhookResponse"];
      /** Secret */
      secret: string;
    };
    /**
     * WebhookResponse
     * @description Wire shape of a :class:`WebhookEndpoint`.
     *
     *     Secret material is NEVER included — cleartext is only visible in
     *     :class:`WebhookCreatedResponse` immediately after creation or
     *     rotation.
     */
    WebhookResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Url */
      url: string;
      /** Description */
      description: string;
      /** Event Types */
      event_types: string[];
      /** Campaign Ids */
      campaign_ids: string[] | null;
      /** Is Active */
      is_active: boolean;
      /** Disabled Reason */
      disabled_reason: string | null;
      /** Disabled Reason Detail */
      disabled_reason_detail: string | null;
      /** Disabled At */
      disabled_at: string | null;
      health: components["schemas"]["EndpointHealthResponse"];
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /**
       * Updated At
       * Format: date-time
       */
      updated_at: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  get_org_api_v1_account_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["OrgResponse"];
        };
      };
    };
  };
  update_org_api_v1_account_patch: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateOrgRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["OrgResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_labels_api_v1_account_labels_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["LabelDefinitionResponse"][];
        };
      };
    };
  };
  update_labels_api_v1_account_labels_put: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateLabelDefinitionsRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["LabelDefinitionResponse"][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_org_users_api_v1_account_users_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["UserResponse"][];
        };
      };
    };
  };
  invite_user_api_v1_account_users_invite_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["InviteUserRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["UserResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_user_role_api_v1_account_users__user_id__role_patch: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        user_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateUserRoleRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  remove_user_api_v1_account_users__user_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        user_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  transfer_ownership_api_v1_account_users__user_id__transfer_ownership_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        user_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_api_keys_api_v1_account_api_keys_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiKeyResponse"][];
        };
      };
    };
  };
  create_api_key_api_v1_account_api_keys_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateApiKeyRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiKeyCreatedResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  revoke_api_key_api_v1_account_api_keys__key_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        key_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_org_roles_api_v1_account_roles_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RoleResponse"][];
        };
      };
    };
  };
  create_custom_role_api_v1_account_roles_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateCustomRoleRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RoleResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_scans_api_v1_scans_get: {
    parameters: {
      query?: {
        status?: string | null;
        country_code?: string | null;
        url?: string | null;
        scan_id?: string | null;
        date_from?: string | null;
        date_to?: string | null;
        timezone?: string | null;
        run_id?: string | null;
        campaign_id?: string | null;
        group_id?: string | null;
        tag?: string | null;
        iab_category?: string | null;
        brand?: string | null;
        page?: number;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_ScanBriefResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_scan_api_v1_scans_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateScanRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ScanResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_bulk_scans_api_v1_scans_bulk_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["BulkScanRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ScanResponse"][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  recheck_scans_api_v1_scans_recheck_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RecheckRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RecheckResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  cancel_scan_api_v1_scans__scan_id__cancel_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scan_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CancelPendingResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_scan_api_v1_scans__scan_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scan_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ScanResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_screenshot_api_v1_scans__scan_id__screenshot_get: {
    parameters: {
      query?: {
        w?: number | null;
      };
      header?: never;
      path: {
        scan_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_creative_screenshot_api_v1_scans__scan_id__creative_screenshot_get: {
    parameters: {
      query?: {
        w?: number | null;
      };
      header?: never;
      path: {
        scan_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_landing_screenshot_api_v1_scans__scan_id__landings__landing_ord__screenshot_get: {
    parameters: {
      query?: {
        w?: number | null;
      };
      header?: never;
      path: {
        scan_id: string;
        landing_ord: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_geos_api_v1_geos_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["GeoResponse"][];
        };
      };
    };
  };
  list_emulators_api_v1_emulators_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["EmulatorResponse"][];
        };
      };
    };
  };
  list_groups_api_v1_campaign_groups_get: {
    parameters: {
      query?: {
        archived?: boolean;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignGroupResponse"][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_group_api_v1_campaign_groups_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateCampaignGroupRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignGroupResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_group_api_v1_campaign_groups__group_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        group_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignGroupResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_group_api_v1_campaign_groups__group_id__patch: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        group_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateCampaignGroupRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignGroupResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  archive_group_api_v1_campaign_groups__group_id__archive_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        group_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["GroupActionResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  unarchive_group_api_v1_campaign_groups__group_id__unarchive_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        group_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["GroupActionResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  pause_group_schedule_api_v1_campaign_groups__group_id__pause_schedule_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        group_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignGroupResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  resume_group_schedule_api_v1_campaign_groups__group_id__resume_schedule_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        group_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignGroupResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  cancel_group_api_v1_campaign_groups__group_id__cancel_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        group_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["GroupActionResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  run_group_api_v1_campaign_groups__group_id__run_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        group_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["GroupActionResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_campaigns_api_v1_campaigns_get: {
    parameters: {
      query?: {
        archived?: boolean;
        group_id?: string | null;
        q?: string | null;
        page?: number;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_CampaignResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_campaign_api_v1_campaigns_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateCampaignRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_campaigns_for_picker_api_v1_campaigns_picker_get: {
    parameters: {
      query?: {
        archived?: boolean;
        group_id?: string | null;
        q?: string | null;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignPickerItem"][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_campaign_api_v1_campaigns__campaign_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        campaign_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_campaign_api_v1_campaigns__campaign_id__patch: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        campaign_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateCampaignRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  archive_campaign_api_v1_campaigns__campaign_id__archive_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        campaign_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  unarchive_campaign_api_v1_campaigns__campaign_id__unarchive_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        campaign_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  run_campaign_api_v1_campaigns__campaign_id__run_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        campaign_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RunResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  cancel_campaign_api_v1_campaigns__campaign_id__cancel_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        campaign_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CancelPendingResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_runs_api_v1_campaigns__campaign_id__runs_get: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
      };
      header?: never;
      path: {
        campaign_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_RunResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_run_api_v1_runs__run_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        run_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RunResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  cancel_run_api_v1_runs__run_id__cancel_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        run_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CancelPendingResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_run_scans_api_v1_runs__run_id__scans_get: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
      };
      header?: never;
      path: {
        run_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_ScanTileResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_scan_tags_api_v1_scans__scan_id__tags_get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scan_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ScanTagResponse"][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_tag_definitions_api_v1_tag_definitions_get: {
    parameters: {
      query?: {
        category?: string | null;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["TagDefinitionWithStatsResponse"][];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_tag_definition_api_v1_tag_definitions__slug__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["TagDefinitionDetailResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_tag_definition_api_v1_tag_definitions__slug__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_tag_definition_api_v1_tag_definitions__slug__patch: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        slug: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateTagDefinitionRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_custom_rules_api_v1_custom_rules_get: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_CustomRuleResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_custom_rule_api_v1_custom_rules_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateCustomRuleRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomRuleResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_custom_rule_api_v1_custom_rules__rule_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        rule_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomRuleResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_custom_rule_api_v1_custom_rules__rule_id__put: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        rule_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateCustomRuleRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomRuleResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_custom_rule_api_v1_custom_rules__rule_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        rule_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  run_rule_test_api_v1_custom_rules_test_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RuleTestRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RuleTestResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_policy_sets_api_v1_policy_sets_get: {
    parameters: {
      query?: {
        visibility?: components["schemas"]["VisibilityType"] | null;
        page?: number;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_PolicySetListItem_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  create_policy_set_api_v1_policy_sets_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreatePolicySetRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PolicySetResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_policy_set_api_v1_policy_sets__policy_set_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        policy_set_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PolicySetResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_policy_set_api_v1_policy_sets__policy_set_id__put: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        policy_set_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdatePolicySetRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PolicySetResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_policy_set_api_v1_policy_sets__policy_set_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        policy_set_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  request_public_approval_api_v1_policy_sets__policy_set_id__request_approval_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        policy_set_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_alerts_api_v1_alerts_get: {
    parameters: {
      query?: {
        campaign_id?: string | null;
        status?: components["schemas"]["AlertStatus"] | null;
        page?: number;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_AlertResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_alert_status_api_v1_alerts__alert_id__status_patch: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        alert_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateAlertStatusRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_alert_stats_api_v1_alerts_stats_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AlertStatsResponse"];
        };
      };
    };
  };
  get_billing_summary_api_v1_billing_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["BillingSummaryResponse"];
        };
      };
    };
  };
  list_usage_api_v1_billing_usage_get: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
        date_from?: string | null;
        date_to?: string | null;
        scan_id?: string | null;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_UsageResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_usage_summary_api_v1_billing_usage_summary_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["UsagePeriodSummaryResponse"];
        };
      };
    };
  };
  list_balance_history_api_v1_billing_history_get: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
        date_from?: string | null;
        date_to?: string | null;
        type?: components["schemas"]["BalanceTransactionType"][] | null;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_BalanceTransactionResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_webhooks_api_v1_webhooks_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WebhookResponse"][];
        };
      };
    };
  };
  create_webhook_api_v1_webhooks_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateWebhookRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WebhookCreatedResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_event_catalog_api_v1_webhooks_event_types_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["EventCatalogResponse"];
        };
      };
    };
  };
  get_webhook_api_v1_webhooks__endpoint_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        endpoint_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WebhookResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  delete_webhook_api_v1_webhooks__endpoint_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        endpoint_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  update_webhook_api_v1_webhooks__endpoint_id__patch: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        endpoint_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateWebhookRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WebhookResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  test_webhook_api_v1_webhooks__endpoint_id__test_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        endpoint_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["TestWebhookRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["TestWebhookResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  rotate_webhook_secret_api_v1_webhooks__endpoint_id__rotate_secret_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        endpoint_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WebhookCreatedResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_delivery_attempts_api_v1_webhooks__endpoint_id__deliveries_get: {
    parameters: {
      query?: {
        success?: boolean | null;
        from_ts?: string | null;
        to_ts?: string | null;
        page?: number;
        limit?: number;
      };
      header?: never;
      path: {
        endpoint_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_DeliveryAttemptResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  replay_delivery_api_v1_webhooks_deliveries__attempt_id__replay_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        attempt_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  bulk_replay_api_v1_webhooks__endpoint_id__replay_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        endpoint_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["BulkReplayRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["BulkReplayResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_destinations_api_v1_alert_notifications_destinations_get: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AlertNotificationDestinationResponse"][];
        };
      };
    };
  };
  delete_destination_api_v1_alert_notifications_destinations__destination_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        destination_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  set_destination_version_api_v1_alert_notifications_destinations__destination_id__version_patch: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        destination_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SetDestinationVersionRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_campaign_overrides_api_v1_alert_notifications_campaigns__campaign_id__overrides_get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        campaign_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CampaignOverridesResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  set_campaign_overrides_api_v1_alert_notifications_campaigns__campaign_id__overrides_put: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        campaign_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SetCampaignOverridesRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  list_invoices_api_v1_invoices_get: {
    parameters: {
      query?: {
        type?: components["schemas"]["InvoiceType"] | null;
        status?: components["schemas"]["InvoiceStatus"] | null;
        organization_id?: string | null;
        page?: number;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedResponse_InvoiceResponse_"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  get_invoice_pdf_api_v1_invoices__invoice_id__pdf_get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        invoice_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InvoicePdfUrlResponse"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  submit_contact_api_v1_contact_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SubmitContactInquiryRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ContactInquiryAcknowledgement"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  submit_demo_inquiry_api_v1_demo_inquiries_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SubmitDemoInquiryRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["DemoInquiryAcknowledgement"];
        };
      };
      /** @description Validation Error */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
}
