/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source : https://app.kaminari.ad/openapi.json (the live URL is the canonical source;
 *          regen happens via `npm run gen:api-types`).
 * Tool   : openapi-typescript
 *
 * Regen is manual and ungated: no CI job diffs this file against the
 * live spec, so the MR that changes `/api/v1` must bring it along.
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
     * @description List scans with filters (comma-separated multi-select; ``iab_category`` legacy alias).
     *
     *     ``tag_match=any`` (default) returns scans carrying at least one of the
     *     requested ``tag`` slugs; ``tag_match=all`` requires every one of them.
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
  "/api/v1/scans/{scan_id}/children": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Scan Children
     * @description List the ad-discovery child scans of a publisher scan.
     */
    get: operations["list_scan_children_api_v1_scans__scan_id__children_get"];
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
     * @description Serve the page screenshot, optionally resized to *w* pixels wide. Public endpoint.
     *
     *     Omitting ``w`` always returns the capture as stored, which for a page
     *     scan is the full scrollable page (bounded crawler-side), not just the
     *     viewport. Passing ``w`` returns a thumbnail whose height is capped at
     *     2.5x its width, so an over-tall page is cropped to its top region —
     *     fetch without ``w`` when you need the whole page.
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
     *
     *     Unlike the page and landing surfaces, ``w`` never crops here — a
     *     creative's aspect ratio is part of what is being verified.
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
  "/api/v1/scans/{scan_id}/creative-html": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Creative Html
     * @description Serve the generated creative HTML source for ad-tag scans. Public endpoint.
     *
     *     Served as ``text/plain`` + ``X-Content-Type-Options: nosniff`` so a
     *     direct navigation shows the source and never executes the untrusted
     *     ad markup in our origin.
     */
    get: operations["get_creative_html_api_v1_scans__scan_id__creative_html_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/{scan_id}/creative-video": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Creative Video
     * @description Serve the stored VAST MediaFile MP4 for VAST scans. Public endpoint.
     */
    get: operations["get_creative_video_api_v1_scans__scan_id__creative_video_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/scans/{scan_id}/vast-xml": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Vast Xml
     * @description Serve the resolved/unwrapped VAST XML for VAST scans. Public endpoint.
     */
    get: operations["get_vast_xml_api_v1_scans__scan_id__vast_xml_get"];
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
     *
     *     Same ``w`` semantics as the page screenshot: the thumbnail is capped
     *     at 2.5x its width, the un-resized artifact is the whole capture.
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
  "/api/v1/proxy/targeting": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Proxy Targeting
     * @description Return the values accepted in a scan's `proxy` block for one country.
     *
     *     Every value listed here is accepted by `POST /api/v1/scans`, in any
     *     case. That guarantee is about validation only: the provider's pool
     *     moves continuously, so a scan may still fail to find an exit node at
     *     crawl time.
     *
     *     An unsupported or unknown country returns 200 with empty arrays
     *     rather than 404 — the useful answer to "can I target here" is a list,
     *     possibly an empty one.
     */
    get: operations["get_proxy_targeting_api_v1_proxy_targeting_get"];
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
     * @description List campaign groups with optional name + date filters.
     *
     *     ``created_*`` and ``last_run_*`` are inclusive calendar days
     *     interpreted in ``timezone`` (IANA name, defaults to UTC). A group's
     *     last run is the newest run across its campaigns, so a group whose
     *     campaigns have never run is excluded once either last-run bound is
     *     set.
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
     *     ``created_from`` / ``created_to`` and ``last_run_from`` /
     *     ``last_run_to`` are inclusive calendar days interpreted in
     *     ``timezone`` (IANA name, defaults to UTC). "Last run" is the newest
     *     run of the campaign, so a campaign that has never run is excluded
     *     once either last-run bound is set.
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
     *
     *     Archived tags are excluded by default. ``include_archived=true``
     *     adds back only the tags your own organization archived; archived
     *     platform tags are retired and never returned.
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
  "/api/v1/policy-sets/{policy_set_id}/campaigns": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Policy Set Campaigns
     * @description List campaigns bound to a policy set (paginated).
     *
     *     ``q`` filters by case-insensitive name substring. The detail response
     *     embeds only a bounded preview of bound campaigns (``campaigns`` +
     *     ``campaigns_total``); this endpoint serves the full membership.
     */
    get: operations["list_policy_set_campaigns_api_v1_policy_sets__policy_set_id__campaigns_get"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/policy-sets/{policy_set_id}/campaigns/attach": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Attach Policy Set Campaigns
     * @description Bind up to 500 campaigns to a policy set.
     *
     *     Incremental alternative to the PUT full-replace: existing bindings
     *     stay intact; campaigns bound to another set are reassigned here.
     */
    post: operations["attach_policy_set_campaigns_api_v1_policy_sets__policy_set_id__campaigns_attach_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/policy-sets/{policy_set_id}/campaigns/detach": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Detach Policy Set Campaigns
     * @description Unbind campaigns from a policy set.
     *
     *     Pass ``campaign_ids`` (ids bound to other sets are ignored) or
     *     ``detach_all=true`` to clear the whole membership.
     */
    post: operations["detach_policy_set_campaigns_api_v1_policy_sets__policy_set_id__campaigns_detach_post"];
    delete?: never;
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
     *     ``policy_set_id``, ``tag`` and ``country_code`` accept comma-separated
     *     values and match alerts carrying any of them. ``date_from``/``date_to``
     *     are inclusive calendar dates interpreted in ``timezone`` and bound
     *     ``created_at``; omitting both lists all time.
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
  "/api/v1/alerts/bulk-status": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Bulk Update Alert Status
     * @description Change status for many alerts at once.
     *
     *     Provide either an explicit ``ids`` list or ``all_matching=true`` with
     *     the optional ``filter_*`` fields, which mirror this endpoint's list
     *     filters. Alerts already in a non-transitionable state are skipped.
     *     Returns updated/skipped counts.
     */
    post: operations["bulk_update_alert_status_api_v1_alerts_bulk_status_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
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
     * @description Get alert counts grouped by status.
     *
     *     Accepts every filter the list endpoint does except ``status`` — the
     *     response buckets by status, so the four counts sum to the ``total``
     *     that ``GET /api/v1/alerts`` reports for the same query. Omitting the
     *     dates means all time, matching the list endpoint; it previously meant
     *     the last 30 days, which broke that sum.
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
     * @description Stream the invoice PDF bytes (404 until rendered).
     *
     *     Bytes are proxied through the API — never a presigned S3 URL (see
     *     ``artifact-serving.mdc``).
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
  "/api/v1/custom-taxonomies": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List Taxonomies
     * @description List taxonomies for the authenticated org.
     */
    get: operations["list_taxonomies_api_v1_custom_taxonomies_get"];
    put?: never;
    /**
     * Create Taxonomy
     * @description Create a new taxonomy with its tree.
     */
    post: operations["create_taxonomy_api_v1_custom_taxonomies_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/custom-taxonomies/parse-text": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Parse Text
     * @description Preview-parse pasted free-form text into a tree (no persistence).
     */
    post: operations["parse_text_api_v1_custom_taxonomies_parse_text_post"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/custom-taxonomies/{taxonomy_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Taxonomy
     * @description Get a taxonomy with its full tree.
     */
    get: operations["get_taxonomy_api_v1_custom_taxonomies__taxonomy_id__get"];
    /**
     * Update Taxonomy
     * @description Replace the full tree atomically and bump ``version``.
     */
    put: operations["update_taxonomy_api_v1_custom_taxonomies__taxonomy_id__put"];
    post?: never;
    /**
     * Delete Taxonomy
     * @description Soft-delete (is_active=false). History rows preserved.
     */
    delete: operations["delete_taxonomy_api_v1_custom_taxonomies__taxonomy_id__delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/custom-taxonomies/{taxonomy_id}/restore": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Restore Taxonomy
     * @description Re-activate a previously soft-deleted taxonomy.
     */
    post: operations["restore_taxonomy_api_v1_custom_taxonomies__taxonomy_id__restore_post"];
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
     * AiCategoryRequest
     * @description The freeform AI-category prefix carried by an ``ai_category`` rule.
     *
     *     ``tier1`` is required; deeper tiers tighten the prefix. Unlike
     *     ``iab_v3`` rules, the API does NOT validate the path against any
     *     canonical tree — the AI category field on a scan is freeform per
     *     classification. The only structural rule is "no gaps":
     *     ``tier3`` requires ``tier2``, ``tier4`` requires ``tier3``.
     */
    AiCategoryRequest: {
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
     * AiCategoryResponse
     * @description Freeform AI category tiers (legacy ``iab_v3`` semantics).
     */
    AiCategoryResponse: {
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
      /** Included Statuses */
      included_statuses: string[];
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
     *
     *     ``rule_type`` discriminates the underlying violation rule
     *     (``tag`` / ``iab_v3`` / ``brand`` / ``ai_category`` / ``custom_taxonomy``).
     *     ``matched_value`` carries the human-readable rendering of what
     *     actually matched (the IAB breadcrumb, brand string, etc.) — for
     *     ``tag`` rules the value is the tag slug itself and ``matched_value``
     *     is therefore ``None``. Together they let API + MCP consumers render
     *     kind-aware copy without re-deriving from synthetic ``tag_slug``
     *     keys (e.g. ``custom_taxonomy:sections:Finance > Lending``).
     *
     *     ``policy_set_name`` is the display name of the policy set that raised
     *     the alert, denormalized so clients can render it without a second
     *     lookup. ``None`` when the alert predates policy-set attribution or the
     *     set has since been deleted.
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
      status: components["schemas"]["AlertStatus"];
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
      /** Policy Set Name */
      policy_set_name?: string | null;
      /**
       * Rule Type
       * @default tag
       */
      rule_type: string;
      /** Matched Value */
      matched_value?: string | null;
    };
    /**
     * AlertStatsResponse
     * @description Aggregated alert counts by status.
     */
    AlertStatsResponse: {
      /** Open */
      open: number;
      /** Escalated */
      escalated: number;
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
    AlertStatus: "open" | "escalated" | "resolved" | "dismissed";
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
     * AttachCampaignsRequest
     * @description Request body for POST /policy-sets/{id}/campaigns/attach.
     *
     *     Incremental bind: the listed campaigns are bound to the set (campaigns
     *     bound to another set are reassigned); other bindings stay intact.
     *     Large memberships are built up in <=500-id batches.
     */
    AttachCampaignsRequest: {
      /** Campaign Ids */
      campaign_ids: string[];
    };
    /**
     * BalanceTransactionResponse
     * @description One ledger row as seen through the API.
     *
     *     ``document_number`` is the unified top-up proforma number
     *     (``PF-YYYY-NNNNNN``) — the single human-readable identifier shown
     *     on the INXY statement, in the cabinet, in admin, and on the
     *     paid-proforma receipt PDF. Populated via the read-side port
     *     :class:`BalanceHistoryQueryService` (cross-domain JOIN to
     *     ``invoices``, directly for bank and via ``payment_sessions`` for
     *     crypto). ``None`` for non-top-up rows (scan charges, subscription
     *     renewals) and legacy crypto sessions issued before the unified
     *     model.
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
      /** Document Number */
      document_number?: string | null;
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
      | "crypto_top_up"
      | "card_top_up";
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
     * @description Request body to create scans for a URL, ad tag, or VAST tag across countries.
     */
    BulkScanRequest: {
      /** Url */
      url?: string | null;
      /**
       * Ad Tag
       * @description Ad tag to check: an HTML snippet OR an http(s) URL of a page with the creative already rendered. Mutually exclusive with url/vast_tag.
       */
      ad_tag?: string | null;
      /**
       * Vast Tag
       * @description VAST video tag to check: an http(s) URL of a VAST endpoint OR raw VAST XML. Mutually exclusive with url/ad_tag.
       */
      vast_tag?: string | null;
      /**
       * Referrer
       * @description Optional http(s) page URL the check is performed from. With ad_tag or vast_tag it is the page the tag is embedded in: the browser commits the harness document on this URL without fetching the publisher, so the creative is embedded exactly as it would be on that page. With url or ad_discovery it is where the visitor came from and travels as the Referer of the page request. Cross-origin subrequests receive the origin only (https://publisher.example/, no path) under Chromium's default strict-origin-when-cross-origin policy — same as on a real publisher. Must be a publicly routable host, carry no credentials, and stay within 2048 characters once normalised.
       */
      referrer?: string | null;
      /** Country Codes */
      country_codes: string[];
      /** Emulator Id */
      emulator_id: string;
      proxy?: components["schemas"]["ProxyTargetRequest"];
      /** Labels */
      labels?: {
        [key: string]: string;
      };
      /**
       * Repeat Count
       * @default 1
       */
      repeat_count: number;
      /** @default isolated */
      repeat_mode: components["schemas"]["RepeatModeType"];
      /**
       * Retry Max Attempts
       * @default 0
       */
      retry_max_attempts: number;
    };
    /**
     * BulkUpdateAlertStatusRequest
     * @description Request body for POST /alerts/bulk-status.
     *
     *     Exactly one selection mode must be used:
     *
     *     * ``ids`` — an explicit, non-empty list of alert ids (capped at
     *       1000 to bound the request).
     *     * ``all_matching=True`` — every alert matching the ``filter_*``
     *       fields (omitting all of them selects the whole org). This is the
     *       "Select all" path for large inboxes.
     *
     *     The ``filter_*`` fields mirror the list endpoint's query params
     *     one-for-one. They have to: "select all matching" must act on exactly
     *     the rows the caller can see in the table, never a wider set.
     *
     *     ``status`` is the target; invalid transitions per alert are skipped.
     */
    BulkUpdateAlertStatusRequest: {
      status: components["schemas"]["AlertStatus"];
      /** Ids */
      ids?: string[] | null;
      /**
       * All Matching
       * @default false
       */
      all_matching: boolean;
      filter_status?: components["schemas"]["AlertStatus"] | null;
      /** Filter Campaign Id */
      filter_campaign_id?: string | null;
      /** Filter Policy Set Ids */
      filter_policy_set_ids?: string[] | null;
      /** Filter Tag Slugs */
      filter_tag_slugs?: string[] | null;
      /** Filter Country Codes */
      filter_country_codes?: string[] | null;
      /** Filter Date From */
      filter_date_from?: string | null;
      /** Filter Date To */
      filter_date_to?: string | null;
      /** Filter Timezone */
      filter_timezone?: string | null;
    };
    /**
     * BulkUpdateAlertStatusResponse
     * @description Outcome of a bulk status change.
     *
     *     ``updated`` is the number of alerts actually transitioned;
     *     ``skipped`` counts selected alerts that were in a state from which
     *     the requested transition is not allowed.
     */
    BulkUpdateAlertStatusResponse: {
      /** Updated */
      updated: number;
      /** Skipped */
      skipped: number;
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
      /** Last Run At */
      last_run_at?: string | null;
    };
    /**
     * CampaignOverrideMode
     * @description Routing mode a client sends / reads for one campaign.
     *
     *     ``INHERIT`` -> fall back to the org-global destinations.
     *     ``OVERRIDE`` -> route only to the campaign's explicit destination list.
     *     ``SILENCE`` -> send nothing for this campaign.
     *
     *     Distinct from :class:`CampaignSettingsMode`, which is the *persisted*
     *     enum and has no ``inherit`` member because inherit is the absence of a
     *     ``campaign_notification_settings`` row.
     * @enum {string}
     */
    CampaignOverrideMode: "inherit" | "override" | "silence";
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
      mode: components["schemas"]["CampaignOverrideMode"];
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
      /** Policy Set Id */
      policy_set_id?: string | null;
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
      /** Vast Tag */
      vast_tag?: string | null;
      /** Referrer */
      referrer?: string | null;
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
      /**
       * Repeat Count
       * @default 1
       */
      repeat_count: number;
      /** @default isolated */
      repeat_mode: components["schemas"]["RepeatMode"];
      /**
       * Retry Max Attempts
       * @default 0
       */
      retry_max_attempts: number;
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
      /**
       * Ad Tag
       * @description Ad tag to check: an HTML snippet OR an http(s) URL of a page with the creative already rendered. Required for ad_tag campaigns.
       */
      ad_tag?: string | null;
      /**
       * Vast Tag
       * @description VAST video tag: an http(s) URL of a VAST endpoint OR raw VAST XML. Required for vast campaigns.
       */
      vast_tag?: string | null;
      /**
       * Referrer
       * @description Optional http(s) page URL every scan of this campaign is checked from. For ad_tag and vast campaigns it is the page the tag is embedded in: the browser commits the harness document on this URL without fetching the publisher, so the creative is embedded exactly as it would be on that page. For url and ad_discovery campaigns it is where the visitor came from and travels as the Referer of the page request. Cross-origin subrequests receive the origin only (https://publisher.example/, no path) under Chromium's default strict-origin-when-cross-origin policy — same as on a real publisher. Must be a publicly routable host, carry no credentials, and stay within 2048 characters once normalised.
       */
      referrer?: string | null;
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
      /**
       * Repeat Count
       * @default 1
       */
      repeat_count: number;
      /** @default isolated */
      repeat_mode: components["schemas"]["RepeatMode"];
      /**
       * Retry Max Attempts
       * @default 0
       */
      retry_max_attempts: number;
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
      /** Tag Visibility */
      tag_visibility?: {
        [key: string]: components["schemas"]["TagVisibility"];
      } | null;
    };
    /**
     * CreateCustomTaxonomyRequest
     * @description Top-level body for taxonomy creation.
     */
    CreateCustomTaxonomyRequest: {
      /** Name */
      name: string;
      /**
       * Description
       * @default
       */
      description: string;
      /**
       * Nodes
       * @default []
       */
      nodes: components["schemas"]["TaxonomyNodeRequest"][];
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
      /** Campaign Ids */
      campaign_ids?: string[];
    };
    /**
     * CreateScanRequest
     * @description Request body to create a single scan.
     */
    CreateScanRequest: {
      /** Url */
      url?: string | null;
      /**
       * Ad Tag
       * @description Ad tag to check: an HTML snippet OR an http(s) URL of a page with the creative already rendered. Mutually exclusive with url/vast_tag.
       */
      ad_tag?: string | null;
      /**
       * Vast Tag
       * @description VAST video tag to check: an http(s) URL of a VAST endpoint OR raw VAST XML. Mutually exclusive with url/ad_tag.
       */
      vast_tag?: string | null;
      /**
       * Referrer
       * @description Optional http(s) page URL the check is performed from. With ad_tag or vast_tag it is the page the tag is embedded in: the browser commits the harness document on this URL without fetching the publisher, so the creative is embedded exactly as it would be on that page. With url or ad_discovery it is where the visitor came from and travels as the Referer of the page request. Cross-origin subrequests receive the origin only (https://publisher.example/, no path) under Chromium's default strict-origin-when-cross-origin policy — same as on a real publisher. Must be a publicly routable host, carry no credentials, and stay within 2048 characters once normalised.
       */
      referrer?: string | null;
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
      /**
       * Ad Discovery
       * @description Publisher ad discovery: detect ad blocks on the page and spawn one child scan per detected ad. Only valid with url (not ad_tag/vast_tag).
       * @default false
       */
      ad_discovery: boolean;
      /**
       * Repeat Count
       * @description How many times to scan this combination. Each repeat is a full scan with its own report and its own billing.
       * @default 1
       */
      repeat_count: number;
      /**
       * @description isolated: every repeat gets a fresh browser and a new IP. shared: all repeats run in one browser behind one IP, carrying cookies and localStorage over. Not available with ad_discovery.
       * @default isolated
       */
      repeat_mode: components["schemas"]["RepeatModeType"];
      /**
       * Retry Max Attempts
       * @description Extra crawl attempts after a technical failure (dead proxy, timeout, browser crash). The same scan is reused, so a retry is never billed twice.
       * @default 0
       */
      retry_max_attempts: number;
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
      /** Organization Id */
      organization_id: string | null;
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
      /**
       * Scope
       * @default personal
       */
      scope: string;
      /** Tag Visibility */
      tag_visibility?: {
        [key: string]: string;
      };
    };
    /**
     * CustomTaxonomyListItem
     * @description Lightweight list-row projection (no nodes — clients open detail view).
     */
    CustomTaxonomyListItem: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Slug */
      slug: string;
      /** Description */
      description: string;
      /** Is Active */
      is_active: boolean;
      /** Version */
      version: number;
      /** Node Count */
      node_count: number;
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
     * CustomTaxonomyRefRequest
     * @description Reference to one node-prefix inside a per-org custom taxonomy.
     *
     *     ``taxonomy_id`` is checked at use-case time against the caller's
     *     org (cross-BC ownership reader); ``tier1`` is required; deeper
     *     tiers tighten the prefix. Tier values are NOT validated against
     *     the taxonomy tree at write time — eval-time mismatch simply
     *     means the rule never fires (safe).
     */
    CustomTaxonomyRefRequest: {
      /**
       * Taxonomy Id
       * Format: uuid
       */
      taxonomy_id: string;
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
     * CustomTaxonomyResponse
     * @description Aggregate metadata + the full node tree.
     */
    CustomTaxonomyResponse: {
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
      /** Slug */
      slug: string;
      /** Description */
      description: string;
      /** Is Active */
      is_active: boolean;
      /** Version */
      version: number;
      /** Nodes */
      nodes: components["schemas"]["TaxonomyNodeResponse"][];
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
     * DetachCampaignsRequest
     * @description Request body for POST /policy-sets/{id}/campaigns/detach.
     *
     *     Incremental unbind: listed campaigns bound to this set get their FK
     *     cleared; ids bound elsewhere are ignored. ``detach_all=true`` clears
     *     the whole org-scoped membership and ignores ``campaign_ids``.
     */
    DetachCampaignsRequest: {
      /** Campaign Ids */
      campaign_ids?: string[];
      /**
       * Detach All
       * @default false
       */
      detach_all: boolean;
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
     *
     *     ``failing_since`` is what the UI should render — it says how long the
     *     partner has actually been down. ``consecutive_failures`` counts
     *     concurrent attempts and is kept for diagnostics only.
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
      /** Failing Since */
      failing_since: string | null;
      /** Paused Until */
      paused_until: string | null;
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
     * IabV3CategoryResponse
     * @description Canonical IAB Content Taxonomy V3 category tiers (validated).
     */
    IabV3CategoryResponse: {
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
     * IabV3PolicyCategoryRequest
     * @description The validated IAB V3 prefix for an ``iab_v3`` rule.
     *
     *     ``tier1`` is required (the canonical V3 tier1 name); deeper tiers
     *     are optional and form a prefix at evaluation time. Path validity
     *     against the canonical V3 tree is enforced by the
     *     :class:`IabV3TaxonomyReader` in the use case: non-canonical paths
     *     are rejected before they reach the repository.
     */
    IabV3PolicyCategoryRequest: {
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
      /** Net Micros */
      net_micros: number;
      /** Vat Micros */
      vat_micros: number;
      /** Vat Rate */
      vat_rate: string;
      /** Vat Reason */
      vat_reason: string;
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
     *     * ``PROFORMA`` — the single document for every top-up (bank +
     *       crypto). Issued up front (status=ISSUED); on settlement it flips
     *       to PAID and the paid proforma IS the receipt. Carries no VAT line
     *       per the EU/Cyprus deposit-on-account rationale. Number prefix
     *       ``PF-``.
     *     * ``FINAL`` — end-of-period statement. For PREPAID orgs it is
     *       informational (status=PAID on issue). For POSTPAID orgs it is
     *       the bill and remains ISSUED until payment confirmation. Number
     *       prefix ``IN-``.
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
     * LinkedCampaignResponse
     * @description Campaign bound to a policy set, surfaced on the Policy Set form.
     */
    LinkedCampaignResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Is Archived */
      is_archived: boolean;
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
     *
     *     ``status`` is the canonical lifecycle field (Phase 0 of COOP-14061).
     *     ``is_active`` remains as a computed backward-compat field — UI
     *     clients still reading the old boolean stay green for one release;
     *     drop it after every consumer has migrated to ``status``.
     *
     *     ``owner_id`` is ``None`` for ownerless orgs — the Kadam system org
     *     (seeded NULL) and any org whose owner was transferred out.
     */
    OrgResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Name */
      name: string;
      /** Owner Id */
      owner_id: string | null;
      status: components["schemas"]["OrganizationStatus"];
      /** Domain */
      domain?: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /**
       * Available Transitions
       * @default []
       */
      available_transitions: components["schemas"]["OrgTransitionOptionResponse"][];
      /**
       * Is Active
       * @description Backward-compat: True iff status == ACTIVE.
       */
      readonly is_active: boolean;
    };
    /**
     * OrgTransitionAction
     * @description The admin operation that drives a given org status transition.
     *
     *     Maps a target :class:`OrganizationStatus` to the endpoint/use case
     *     that reaches it, so the UI can dispatch the right call without
     *     re-encoding the transition graph.
     * @enum {string}
     */
    OrgTransitionAction: "approve" | "reject" | "suspend" | "reactivate";
    /**
     * OrgTransitionOptionResponse
     * @description A status the org may move to, plus the admin action that does it.
     *
     *     Computed from :class:`OrgStatusTransitionPolicy` and surfaced on the
     *     admin org detail response so the UI offers exactly the transitions
     *     the backend allows.
     */
    OrgTransitionOptionResponse: {
      target_status: components["schemas"]["OrganizationStatus"];
      action: components["schemas"]["OrgTransitionAction"];
    };
    /**
     * OrganizationStatus
     * @description Lifecycle state of an :class:`Organization`.
     *
     *     * ``PENDING_EMAIL_VERIFICATION`` — self-service signup, owner has
     *       not clicked the verification link yet.
     *     * ``PENDING_ADMIN_APPROVAL`` — email verified, awaiting admin
     *       approval (gated by ``signup_admin_approval_required`` flag).
     *     * ``ACTIVE`` — fully usable; users can log in, scans run, billing
     *       meters tick.
     *     * ``SUSPENDED`` — admin froze the org (formerly ``is_active=False``).
     *     * ``REJECTED`` — admin denied a self-service signup; soft-delete
     *       for audit trail. Recoverable: an admin can approve it in place
     *       (REJECTED → ACTIVE via ``AdminApproveOrganization``) or unblock
     *       it to free the email for a fresh signup (deletes the owner).
     * @enum {string}
     */
    OrganizationStatus:
      | "pending_email_verification"
      | "pending_admin_approval"
      | "active"
      | "suspended"
      | "rejected";
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
    /** PaginatedResponse[LinkedCampaignResponse] */
    PaginatedResponse_LinkedCampaignResponse_: {
      /** Items */
      items: components["schemas"]["LinkedCampaignResponse"][];
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
     * ParseTaxonomyTextRequest
     * @description Body for the paste-import preview endpoint.
     */
    ParseTaxonomyTextRequest: {
      /** Text */
      text: string;
    };
    /**
     * ParseTaxonomyTextResponse
     * @description Flat node list + warnings ("inconsistent indentation", "depth > 4 truncated").
     */
    ParseTaxonomyTextResponse: {
      /** Nodes */
      nodes: components["schemas"]["ParsedTaxonomyNode"][];
      /** Warnings */
      warnings: string[];
    };
    /**
     * ParsedTaxonomyNode
     * @description One parsed node from the paste-import preview.
     *
     *     No identifiers — clients allocate ``client_id``s locally before
     *     submitting via :class:`CreateCustomTaxonomyRequest`.
     */
    ParsedTaxonomyNode: {
      /** Level */
      level: number;
      /** Name */
      name: string;
      /** Description */
      description: string;
    };
    /**
     * PolicyEntryAiCategoryResponse
     * @description The freeform AI-category prefix on an ``ai_category`` rule.
     */
    PolicyEntryAiCategoryResponse: {
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
     * PolicyEntryCustomTaxonomyResponse
     * @description The custom-taxonomy node prefix on a ``custom_taxonomy`` rule.
     */
    PolicyEntryCustomTaxonomyResponse: {
      /**
       * Taxonomy Id
       * Format: uuid
       */
      taxonomy_id: string;
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
     * PolicyEntryIabV3Response
     * @description The validated IAB V3 prefix on an ``iab_v3`` rule.
     */
    PolicyEntryIabV3Response: {
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
     * PolicyEntryRequest
     * @description A single entry in a policy set creation/update request.
     *
     *     Sum type discriminated by :attr:`rule_type`. The validator below
     *     enforces that exactly the value-block matching ``rule_type`` is
     *     populated; the API layer additionally checks the IAB V3 prefix
     *     against the canonical taxonomy and validates ``custom_taxonomy``
     *     ownership against the caller's organization.
     */
    PolicyEntryRequest: {
      /**
       * Rule Type
       * @default tag
       * @enum {string}
       */
      rule_type: "tag" | "iab_v3" | "brand" | "ai_category" | "custom_taxonomy";
      /** Tag Slug */
      tag_slug?: string | null;
      iab_v3?: components["schemas"]["IabV3PolicyCategoryRequest"] | null;
      /** Brand */
      brand?: string | null;
      ai_category?: components["schemas"]["AiCategoryRequest"] | null;
      custom_taxonomy?: components["schemas"]["CustomTaxonomyRefRequest"] | null;
      /** Country Codes */
      country_codes?: string[];
    };
    /**
     * PolicyEntryResponse
     * @description A single entry in a policy set response.
     *
     *     Sum type — exactly one value-block is populated per row depending
     *     on :attr:`rule_type` (``tag`` / ``iab_v3`` / ``brand`` /
     *     ``ai_category`` / ``custom_taxonomy``). The other blocks are
     *     ``null`` and should be ignored by the client.
     */
    PolicyEntryResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Rule Type */
      rule_type: string;
      /** Tag Slug */
      tag_slug?: string | null;
      iab_v3?: components["schemas"]["PolicyEntryIabV3Response"] | null;
      /** Brand */
      brand?: string | null;
      ai_category?: components["schemas"]["PolicyEntryAiCategoryResponse"] | null;
      custom_taxonomy?: components["schemas"]["PolicyEntryCustomTaxonomyResponse"] | null;
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
     * @description Policy set returned by API (with entries + bound-campaigns preview).
     *
     *     ``campaigns`` is a bounded preview (first N by name, N =
     *     ``PoliciesSettings.campaigns_preview_limit``); ``campaigns_total``
     *     carries the real membership size. The full list is served by the
     *     paginated ``GET /policy-sets/{id}/campaigns`` endpoint.
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
      /** Campaigns */
      campaigns?: components["schemas"]["LinkedCampaignResponse"][];
      /**
       * Campaigns Total
       * @default 0
       */
      campaigns_total: number;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
    };
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
     * ProxyTargetingResponse
     * @description Values accepted in a scan's ``proxy`` block for one country.
     */
    ProxyTargetingResponse: {
      /**
       * Country Code
       * @description ISO 3166-1 alpha-2 code, upper-case.
       */
      country_code: string;
      /**
       * Proxy Type
       * @description Network these values belong to. The catalogues differ substantially between residential and mobile, so a value listed for one is not necessarily accepted for the other.
       */
      proxy_type: string;
      /**
       * Regions
       * @description Accepted values for `proxy.region`, ordered by pool size (largest first).
       */
      regions: string[];
      /**
       * Cities
       * @description Accepted values for `proxy.city`, ordered by pool size. Narrowed to the `region` query parameter when one is given; otherwise the country-wide list, which is what to pick from when targeting by country alone. Pairing a region with a city from a different region yields no exit node.
       */
      cities: string[];
      /**
       * Isps
       * @description Accepted values for `proxy.isp`, ordered by pool size. Mobile carriers when `proxy_type=mobile`.
       */
      isps: string[];
      /**
       * Refreshed At
       * @description When these lists were last verified against the upstream provider, or null if we have not synced this country yet. Null means 'not looked yet', which is different from empty lists with a timestamp, which means 'no targeting available here'. This moves on every sync whether or not the contents changed — use the ETag header to detect actual changes.
       */
      refreshed_at: string | null;
      /**
       * Ttl Seconds
       * @description How long these lists may be cached before we re-verify them upstream. Send the ETag back as If-None-Match to revalidate cheaply.
       */
      ttl_seconds: number;
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
     * RepeatMode
     * @description How the repeats of one ``url x country x device`` relate to each other.
     *
     *     Value-compatible with scanning's ``RepeatModeType`` — campaigns owns
     *     its own copy because the write side must not import another domain's
     *     package (``check-imports``), and only the value crosses the boundary.
     * @enum {string}
     */
    RepeatMode: "isolated" | "shared";
    /**
     * RepeatModeType
     * @description Browser-session isolation mode for a group of repeated scans.
     *
     *     ``ISOLATED`` is the historical (and only) crawler behaviour: every
     *     scan gets its own Chromium, its own context and its own proxy session,
     *     so every repeat sees a new IP and an empty cookie jar.
     *
     *     ``SHARED`` makes the crawler run the whole group inside one browser
     *     session — one proxy session (one IP) and ``storage_state`` carried from
     *     one repeat to the next. Only groups in this mode carry a
     *     ``Scan.repeat_session_id``.
     * @enum {string}
     */
    RepeatModeType: "isolated" | "shared";
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
     *
     *     ``context`` selects the prompt mode for LLM rules:
     *
     *     * ``isolated`` (default) — the prompt carries only the draft rule;
     *       good for iterating on criteria wording.
     *     * ``production`` — the prompt carries the org's full active rule
     *       set with the draft substituted for its saved version
     *       (``rule_id``), exactly like a real scan; the reply is filtered
     *       to the draft's tags. Only valid for ``rule_type="llm"``.
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
      /**
       * Name
       * @default Test Rule
       */
      name: string;
      /**
       * Context
       * @default isolated
       * @enum {string}
       */
      context: "isolated" | "production";
      /** Rule Id */
      rule_id?: string | null;
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
     *     Ad-tag scans surface as ``is_ad_tag=True`` with empty ``url``; VAST
     *     video-ad scans surface as ``is_vast=True`` with empty ``url``. In both
     *     cases the UI shows ``campaign_name`` (and ``offer_url`` if present) in
     *     the URL column instead of the empty input URL. Neither the HTML creative
     *     nor the VAST tag is leaked in the list response — only the boolean flag.
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
      /**
       * Report Url
       * @default
       */
      report_url: string;
      /**
       * Public Report Url
       * @default
       */
      public_report_url: string;
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
      /**
       * Is Vast
       * @default false
       */
      is_vast: boolean;
      /** Parent Scan Id */
      parent_scan_id?: string | null;
      /**
       * Ad Discovery
       * @default false
       */
      ad_discovery: boolean;
      /** Slot Index */
      slot_index?: number | null;
      /** Ad Kind */
      ad_kind?: string | null;
      /**
       * Network
       * @default
       */
      network: string;
      /**
       * Emulator Display Name
       * @default
       */
      emulator_display_name: string;
      /**
       * Emulator Category
       * @default
       */
      emulator_category: string;
      /**
       * Repeat Index
       * @default 0
       */
      repeat_index: number;
      /**
       * Repeat Total
       * @default 1
       */
      repeat_total: number;
      /** Repeat Session Id */
      repeat_session_id?: string | null;
      /**
       * Retry Attempt
       * @default 0
       */
      retry_attempt: number;
      /**
       * Retry Max Attempts
       * @default 0
       */
      retry_max_attempts: number;
    };
    /**
     * ScanClassificationResponse
     * @description Classification result for a scan — AI category + IAB V3 + brand + custom taxonomies.
     */
    ScanClassificationResponse: {
      /** Brand */
      brand?: string | null;
      ai_category?: components["schemas"]["AiCategoryResponse"] | null;
      iab_v3?: components["schemas"]["IabV3CategoryResponse"] | null;
      /**
       * Custom Taxonomies
       * @default []
       */
      custom_taxonomies: components["schemas"]["ScanTaxonomyClassificationResponse"][];
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
      /** Parent Scan Id */
      parent_scan_id?: string | null;
      /**
       * Ad Discovery
       * @default false
       */
      ad_discovery: boolean;
      /** Slot Index */
      slot_index?: number | null;
      /** Ad Kind */
      ad_kind?: string | null;
      /**
       * Network
       * @default
       */
      network: string;
      /** Offer Url */
      offer_url: string;
      /** Redirect Chain */
      redirect_chain: components["schemas"]["RedirectHopResponse"][];
      /**
       * Screenshot Url
       * @default
       */
      screenshot_url: string;
      /**
       * Report Url
       * @default
       */
      report_url: string;
      /**
       * Public Report Url
       * @default
       */
      public_report_url: string;
      /** Ad Tag */
      ad_tag?: string | null;
      /** Vast Tag */
      vast_tag?: string | null;
      /** Referrer */
      referrer?: string | null;
      /**
       * Creative Kind
       * @default banner
       * @enum {string}
       */
      creative_kind: "banner" | "video";
      /**
       * Creative Screenshot Url
       * @default
       */
      creative_screenshot_url: string;
      /**
       * Creative Video Url
       * @default
       */
      creative_video_url: string;
      /**
       * Vast Xml Url
       * @default
       */
      vast_xml_url: string;
      /**
       * Creative Html Url
       * @default
       */
      creative_html_url: string;
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
      video?: components["schemas"]["VideoMetaResponse"] | null;
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
      /** Campaign Group Id */
      campaign_group_id?: string | null;
      /** Campaign Group Name */
      campaign_group_name?: string | null;
      /**
       * Created At
       * Format: date-time
       */
      created_at: string;
      /** Completed At */
      completed_at: string | null;
      /** Landings */
      landings?: components["schemas"]["LandingResponse"][];
      /**
       * Repeat Index
       * @default 0
       */
      repeat_index: number;
      /**
       * Repeat Total
       * @default 1
       */
      repeat_total: number;
      /** Repeat Session Id */
      repeat_session_id?: string | null;
      /**
       * Repeat Scan Ids
       * @description The sibling scans this request also created, excluding this one. Populated only by the create endpoints — list and detail responses leave it empty.
       */
      repeat_scan_ids?: string[];
      /**
       * Retry Attempt
       * @default 0
       */
      retry_attempt: number;
      /**
       * Retry Max Attempts
       * @default 0
       */
      retry_max_attempts: number;
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
     *
     *     ``RECHECKING`` is a **transient** state used **only** by the recheck
     *     flow. The recheck use case atomically moves a scan from a terminal
     *     state into ``RECHECKING``, wipes prior tags (CH tombstones), wipes
     *     scan_part_state, then atomically transitions to ``CHECKING`` with
     *     fresh ``expected_parts``. Both transitions bypass the forward-only
     *     ``advance_status()`` guard via dedicated repository methods.
     *
     *     Why RECHECKING exists: stale ``check.parts.*`` messages for a now-
     *     rechecking scan must NOT write tags (those would survive the wipe
     *     without tombstones, corrupting the post-recheck tag set). Consumers
     *     check ``WRITE_BLOCKED_STATUSES`` and skip the message when the scan
     *     is in ``RECHECKING``. Defence in depth — the TagWriterAdapter's UoW
     *     also re-reads the scan status before save.
     * @enum {string}
     */
    ScanStatus:
      | "pending"
      | "running"
      | "crawled"
      | "checking"
      | "checking_async"
      | "rechecking"
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
       * Surface
       * @default page
       */
      surface: string;
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
     * ScanTaxonomyClassificationResponse
     * @description One per-(scan, custom-taxonomy) classification.
     *
     *     Mirrors the ``scan_taxonomy_classifications`` row + adds the
     *     taxonomy ``name`` and ``slug`` so the UI can render the block
     *     without a second round-trip. ``leaf_node_id`` is included for
     *     click-to-filter integrations on the scan list page; ``used_default``
     *     is a UI hint that the AI fell back to the default leaf rather
     *     than picking a specific category.
     */
    ScanTaxonomyClassificationResponse: {
      /**
       * Taxonomy Id
       * Format: uuid
       */
      taxonomy_id: string;
      /** Taxonomy Name */
      taxonomy_name: string;
      /** Taxonomy Slug */
      taxonomy_slug: string;
      /** Taxonomy Version */
      taxonomy_version: number;
      /** Leaf Node Id */
      leaf_node_id: string | null;
      /** Tier1 */
      tier1: string | null;
      /** Tier2 */
      tier2?: string | null;
      /** Tier3 */
      tier3?: string | null;
      /** Tier4 */
      tier4?: string | null;
      /**
       * Used Default
       * @default false
       */
      used_default: boolean;
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
       * @description Page screenshot at ?w=400 — a top-cropped tile of the capture, not the whole page. Fetch the endpoint without ?w= for the full frame.
       * @default
       */
      screenshot_url: string;
      /**
       * Report Url
       * @default
       */
      report_url: string;
      /**
       * Public Report Url
       * @default
       */
      public_report_url: string;
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
      mode: components["schemas"]["CampaignOverrideMode"];
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
      /** Scope */
      scope: string;
      /** Organization Id */
      organization_id: string | null;
      /** Visibility */
      visibility: string;
      /** Severity */
      severity: string;
      /** Scans Count */
      scans_count: number;
      /** Rules Count */
      rules_count: number;
      /** Archived At */
      archived_at?: string | null;
      /** Linked Rules */
      linked_rules?: components["schemas"]["LinkedRuleResponse"][];
    };
    /**
     * TagDefinitionWithStatsResponse
     * @description Tag definition enriched with scans and rules counts.
     *
     *     ``visibility`` is one of ``hidden`` / ``internal`` / ``public``
     *     (see :class:`TagVisibility`). ``scans_count`` is scoped to the
     *     caller's organization. ``archived_at`` is ``null`` for active tags
     *     and a timestamp for archived (hidden-but-kept) tags.
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
      /** Scope */
      scope: string;
      /** Organization Id */
      organization_id: string | null;
      /** Visibility */
      visibility: string;
      /** Severity */
      severity: string;
      /** Scans Count */
      scans_count: number;
      /** Rules Count */
      rules_count: number;
      /** Archived At */
      archived_at?: string | null;
    };
    /**
     * TagMatchMode
     * @description Boolean semantics of the scan-list tag filter.
     *
     *     ``ANY`` matches scans carrying at least one requested slug, ``ALL``
     *     only scans carrying every one of them. ``ANY`` is the default and
     *     the historical behaviour.
     * @enum {string}
     */
    TagMatchMode: "any" | "all";
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
     * TagVisibility
     * @description Visibility tier for a tag definition.
     * @enum {string}
     */
    TagVisibility: "hidden" | "internal" | "public";
    /**
     * TaxonomyNodeRequest
     * @description One node in the create/update body.
     *
     *     ``client_id`` is a free-form string the client uses to reference this
     *     node from sibling children's ``parent_client_id``. ``parent_client_id``
     *     is None for tier-1 roots. The server replaces both fields with fresh
     *     UUIDs before persisting.
     */
    TaxonomyNodeRequest: {
      /** Client Id */
      client_id: string;
      /** Parent Client Id */
      parent_client_id?: string | null;
      /** Name */
      name: string;
      /**
       * Description
       * @default
       */
      description: string;
      /**
       * Is Default
       * @default false
       */
      is_default: boolean;
    };
    /**
     * TaxonomyNodeResponse
     * @description One node as returned by the API.
     *
     *     Server-side UUIDs are exposed because clients persist them locally
     *     and re-send them on update (parent_id wiring). A leaf node where
     *     ``is_default`` is true is the one the LLM falls back to when no
     *     other tier matches.
     */
    TaxonomyNodeResponse: {
      /**
       * Id
       * Format: uuid
       */
      id: string;
      /** Parent Id */
      parent_id: string | null;
      /** Level */
      level: number;
      /** Position */
      position: number;
      /** Name */
      name: string;
      /** Description */
      description: string;
      /** Is Default */
      is_default: boolean;
    };
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
      /**
       * Ad Tag
       * @description Ad tag to check: an HTML snippet OR an http(s) URL of a page with the creative already rendered. Only for ad_tag campaigns.
       */
      ad_tag?: string | null;
      /**
       * Vast Tag
       * @description VAST video tag: an http(s) URL of a VAST endpoint OR raw VAST XML. Only for vast campaigns.
       */
      vast_tag?: string | null;
      /**
       * Referrer
       * @description Optional http(s) page URL every scan of this campaign is checked from. For ad_tag and vast campaigns it is the page the tag is embedded in: the browser commits the harness document on this URL without fetching the publisher, so the creative is embedded exactly as it would be on that page. For url and ad_discovery campaigns it is where the visitor came from and travels as the Referer of the page request. Cross-origin subrequests receive the origin only (https://publisher.example/, no path) under Chromium's default strict-origin-when-cross-origin policy — same as on a real publisher. Must be a publicly routable host, carry no credentials, and stay within 2048 characters once normalised.
       */
      referrer?: string | null;
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
      /** Repeat Count */
      repeat_count?: number | null;
      repeat_mode?: components["schemas"]["RepeatMode"] | null;
      /** Retry Max Attempts */
      retry_max_attempts?: number | null;
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
      /** Tag Visibility */
      tag_visibility?: {
        [key: string]: components["schemas"]["TagVisibility"];
      } | null;
    };
    /**
     * UpdateCustomTaxonomyRequest
     * @description Atomic replace-tree update.
     *
     *     The whole tree is replaced; clients send the desired final state.
     *     The server bumps ``version`` so historical
     *     ``scan_taxonomy_classifications`` can be tied back to a snapshot.
     */
    UpdateCustomTaxonomyRequest: {
      /** Name */
      name: string;
      /**
       * Description
       * @default
       */
      description: string;
      /**
       * Nodes
       * @default []
       */
      nodes: components["schemas"]["TaxonomyNodeRequest"][];
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
     *
     *     ``name`` accepts the same bounds as
     *     :class:`UpdateOrganizationAdminRequest` so both rename paths (owner
     *     self-service vs admin override) share a single validation contract:
     *     1-200 chars, leading/trailing whitespace stripped before persistence.
     */
    UpdateOrgRequest: {
      /** Name */
      name?: string | null;
    };
    /**
     * UpdatePolicySetRequest
     * @description Request body for PUT /policy-sets/{id}.
     *
     *     ``campaign_ids`` uses full-replace semantics but is only applied when
     *     present in the payload (``model_fields_set``) so v1 clients that omit
     *     it never wipe existing bindings.
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
      /** Campaign Ids */
      campaign_ids?: string[];
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
      visibility?: components["schemas"]["TagVisibility"] | null;
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
     *
     *     The ``organization_*`` and ``role_id`` fields are additive
     *     (introduced in COOP-14061 follow-up) — older clients ignore
     *     them while admin SPA (and self-service "team members" pages)
     *     need them for filtering, linking, and editing.
     *
     *     ``role_scope`` ("org" / "admin") is additive too (COOP-14131): the
     *     admin SPA inspects it to (a) hide admin-scope rows from the regular
     *     Edit-User role dropdown and (b) render a read-only Internal Admin
     *     badge in place of editable controls when the user is staff. Older
     *     clients that ignore it keep working.
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
      /**
       * Role Id
       * Format: uuid
       */
      role_id: string;
      /** Role Name */
      role_name: string;
      /**
       * Role Scope
       * @default org
       */
      role_scope: string;
      /**
       * Organization Id
       * Format: uuid
       */
      organization_id: string;
      /** Organization Name */
      organization_name: string;
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
     * VideoMetaResponse
     * @description Slim VAST video metadata surfaced on the scan report.
     *
     *     Present only for VAST scans. The rendered video frame is served via
     *     the existing creative-screenshot URL; this block carries the
     *     video-specific facts the report shows alongside it.
     */
    VideoMetaResponse: {
      /**
       * Duration Ms
       * @default 0
       */
      duration_ms: number;
      /**
       * Mediafile Url
       * @default
       */
      mediafile_url: string;
      /**
       * Vast Version
       * @default
       */
      vast_version: string;
      /**
       * Ad System
       * @default
       */
      ad_system: string;
      /**
       * Is Vpaid
       * @default false
       */
      is_vpaid: boolean;
      /**
       * Wrapper Depth
       * @default 0
       */
      wrapper_depth: number;
      /**
       * Click Through
       * @default
       */
      click_through: string;
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
        parent_scan_id?: string | null;
        tag?: string | null;
        tag_match?: components["schemas"]["TagMatchMode"];
        ai_category?: string | null;
        iab_v3_category?: string | null;
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
  list_scan_children_api_v1_scans__scan_id__children_get: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
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
  get_creative_html_api_v1_scans__scan_id__creative_html_get: {
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
  get_creative_video_api_v1_scans__scan_id__creative_video_get: {
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
  get_vast_xml_api_v1_scans__scan_id__vast_xml_get: {
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
  get_proxy_targeting_api_v1_proxy_targeting_get: {
    parameters: {
      query: {
        /** @description ISO 3166-1 alpha-2 country code. Case-insensitive. */
        country_code: string;
        /** @description Which network to describe. Required in practice: the residential and mobile catalogues differ substantially, so values taken from one may be rejected for the other. */
        proxy_type?: "residential" | "mobile";
        /** @description Narrow `cities` to one region. Omit for the country-wide city list. Pass a value from this endpoint's own `regions` array. */
        region?: string;
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
          "application/json": components["schemas"]["ProxyTargetingResponse"];
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
        q?: string | null;
        created_from?: string | null;
        created_to?: string | null;
        last_run_from?: string | null;
        last_run_to?: string | null;
        timezone?: string;
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
        created_from?: string | null;
        created_to?: string | null;
        last_run_from?: string | null;
        last_run_to?: string | null;
        timezone?: string;
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
        include_archived?: boolean;
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
  list_policy_set_campaigns_api_v1_policy_sets__policy_set_id__campaigns_get: {
    parameters: {
      query?: {
        q?: string | null;
        page?: number;
        limit?: number;
      };
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
          "application/json": components["schemas"]["PaginatedResponse_LinkedCampaignResponse_"];
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
  attach_policy_set_campaigns_api_v1_policy_sets__policy_set_id__campaigns_attach_post: {
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
        "application/json": components["schemas"]["AttachCampaignsRequest"];
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
  detach_policy_set_campaigns_api_v1_policy_sets__policy_set_id__campaigns_detach_post: {
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
        "application/json": components["schemas"]["DetachCampaignsRequest"];
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
        policy_set_id?: string | null;
        tag?: string | null;
        country_code?: string | null;
        date_from?: string | null;
        date_to?: string | null;
        timezone?: string;
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
  bulk_update_alert_status_api_v1_alerts_bulk_status_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["BulkUpdateAlertStatusRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["BulkUpdateAlertStatusResponse"];
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
  get_alert_stats_api_v1_alerts_stats_get: {
    parameters: {
      query?: {
        campaign_id?: string | null;
        policy_set_id?: string | null;
        tag?: string | null;
        country_code?: string | null;
        date_from?: string | null;
        date_to?: string | null;
        timezone?: string;
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
          "application/json": components["schemas"]["AlertStatsResponse"];
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
      /** @description Invoice PDF bytes */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/pdf": unknown;
        };
      };
      /** @description Invoice not found or PDF not yet rendered */
      404: {
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
  list_taxonomies_api_v1_custom_taxonomies_get: {
    parameters: {
      query?: {
        include_inactive?: boolean;
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
          "application/json": components["schemas"]["CustomTaxonomyListItem"][];
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
  create_taxonomy_api_v1_custom_taxonomies_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateCustomTaxonomyRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomTaxonomyResponse"];
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
  parse_text_api_v1_custom_taxonomies_parse_text_post: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ParseTaxonomyTextRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ParseTaxonomyTextResponse"];
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
  get_taxonomy_api_v1_custom_taxonomies__taxonomy_id__get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        taxonomy_id: string;
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
          "application/json": components["schemas"]["CustomTaxonomyResponse"];
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
  update_taxonomy_api_v1_custom_taxonomies__taxonomy_id__put: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        taxonomy_id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateCustomTaxonomyRequest"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CustomTaxonomyResponse"];
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
  delete_taxonomy_api_v1_custom_taxonomies__taxonomy_id__delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        taxonomy_id: string;
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
  restore_taxonomy_api_v1_custom_taxonomies__taxonomy_id__restore_post: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        taxonomy_id: string;
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
}
