export const NEWS_EXCERPT_COLUMNS = ['news.excerpt_en', 'news.excerpt_th'] as const;
export const NEWS_EDITORIAL_COLUMNS = [
  'news.feature_on_home',
  'news.home_priority',
  'news.open_in_new_tab',
  'news.external_url',
] as const;
export const GLOBAL_BASE_COLUMNS = ['site_settings.*', 'homepage.*', 'game_guide_page.*', 'news_page.*'] as const;
export const GLOBAL_SUPPORT_TABLES = [
  'site_settings_navigation_links',
  'site_settings_footer_groups',
  'site_settings_footer_groups_links',
  'homepage_features',
  'game_guide_page_features',
  'game_guide_page_pillars_en',
  'game_guide_page_pillars_th',
] as const;

export const ENSURE_NEWS_EXCERPT_COLUMNS_SQL = `
  ALTER TABLE "news"
  ADD COLUMN IF NOT EXISTS "excerpt_en" varchar;

  ALTER TABLE "news"
  ADD COLUMN IF NOT EXISTS "excerpt_th" varchar;
`;

export const ENSURE_NEWS_EDITORIAL_COLUMNS_SQL = `
  ALTER TABLE "news"
  ADD COLUMN IF NOT EXISTS "feature_on_home" boolean DEFAULT false;

  ALTER TABLE "news"
  ADD COLUMN IF NOT EXISTS "home_priority" numeric DEFAULT 0;

  ALTER TABLE "news"
  ADD COLUMN IF NOT EXISTS "open_in_new_tab" boolean DEFAULT false;

  ALTER TABLE "news"
  ADD COLUMN IF NOT EXISTS "external_url" varchar;
`;

export const ENSURE_GLOBAL_BASE_COLUMNS_SQL = `
  ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "site_name" varchar,
  ADD COLUMN IF NOT EXISTS "site_description" varchar,
  ADD COLUMN IF NOT EXISTS "logo_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "favicon_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "registration_url" varchar,
  ADD COLUMN IF NOT EXISTS "social_links_facebook" varchar,
  ADD COLUMN IF NOT EXISTS "social_links_tiktok" varchar,
  ADD COLUMN IF NOT EXISTS "social_links_youtube" varchar,
  ADD COLUMN IF NOT EXISTS "social_links_discord" varchar,
  ADD COLUMN IF NOT EXISTS "social_links_twitter" varchar,
  ADD COLUMN IF NOT EXISTS "social_links_line" varchar,
  ADD COLUMN IF NOT EXISTS "analytics_ga_id" varchar,
  ADD COLUMN IF NOT EXISTS "analytics_meta_pixel_id" varchar,
  ADD COLUMN IF NOT EXISTS "analytics_gtm_id" varchar,
  ADD COLUMN IF NOT EXISTS "analytics_adjust_app_token" varchar,
  ADD COLUMN IF NOT EXISTS "analytics_adjust_environment" varchar,
  ADD COLUMN IF NOT EXISTS "seo_og_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "seo_keywords" varchar,
  ADD COLUMN IF NOT EXISTS "seo_twitter_handle" varchar,
  ADD COLUMN IF NOT EXISTS "footer_copyright_text" varchar,
  ADD COLUMN IF NOT EXISTS "footer_terms_url" varchar,
  ADD COLUMN IF NOT EXISTS "footer_privacy_url" varchar,
  ADD COLUMN IF NOT EXISTS "footer_support_url" varchar,
  ADD COLUMN IF NOT EXISTS "footer_brand_copy_en" varchar,
  ADD COLUMN IF NOT EXISTS "footer_brand_copy_th" varchar,
  ADD COLUMN IF NOT EXISTS "footer_platforms_label_en" varchar,
  ADD COLUMN IF NOT EXISTS "footer_platforms_label_th" varchar;

  ALTER TABLE "homepage"
  ADD COLUMN IF NOT EXISTS "background_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "background_video_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "tagline_en" varchar,
  ADD COLUMN IF NOT EXISTS "tagline_th" varchar,
  ADD COLUMN IF NOT EXISTS "tagline_image_en_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "tagline_image_th_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "cta_text_en" varchar,
  ADD COLUMN IF NOT EXISTS "cta_text_th" varchar,
  ADD COLUMN IF NOT EXISTS "cta_link" varchar,
  ADD COLUMN IF NOT EXISTS "weapons_bg_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "weapons_badge_en" varchar,
  ADD COLUMN IF NOT EXISTS "weapons_badge_th" varchar,
  ADD COLUMN IF NOT EXISTS "weapons_title_en" varchar,
  ADD COLUMN IF NOT EXISTS "weapons_title_th" varchar,
  ADD COLUMN IF NOT EXISTS "weapons_intro_en" varchar,
  ADD COLUMN IF NOT EXISTS "weapons_intro_th" varchar,
  ADD COLUMN IF NOT EXISTS "highlights_badge_en" varchar,
  ADD COLUMN IF NOT EXISTS "highlights_badge_th" varchar,
  ADD COLUMN IF NOT EXISTS "highlights_title_en" varchar,
  ADD COLUMN IF NOT EXISTS "highlights_title_th" varchar,
  ADD COLUMN IF NOT EXISTS "highlights_bg_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "highlights_intro_en" varchar,
  ADD COLUMN IF NOT EXISTS "highlights_intro_th" varchar,
  ADD COLUMN IF NOT EXISTS "news_bg_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "news_badge_en" varchar,
  ADD COLUMN IF NOT EXISTS "news_badge_th" varchar,
  ADD COLUMN IF NOT EXISTS "news_title_en" varchar,
  ADD COLUMN IF NOT EXISTS "news_title_th" varchar,
  ADD COLUMN IF NOT EXISTS "news_intro_en" varchar,
  ADD COLUMN IF NOT EXISTS "news_intro_th" varchar;

  ALTER TABLE "game_guide_page"
  ADD COLUMN IF NOT EXISTS "hero_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "badge_en" varchar,
  ADD COLUMN IF NOT EXISTS "badge_th" varchar,
  ADD COLUMN IF NOT EXISTS "title_en" varchar,
  ADD COLUMN IF NOT EXISTS "title_th" varchar,
  ADD COLUMN IF NOT EXISTS "subtitle_en" varchar,
  ADD COLUMN IF NOT EXISTS "subtitle_th" varchar,
  ADD COLUMN IF NOT EXISTS "hero_panel_label_en" varchar,
  ADD COLUMN IF NOT EXISTS "hero_panel_label_th" varchar,
  ADD COLUMN IF NOT EXISTS "hero_panel_copy_en" varchar,
  ADD COLUMN IF NOT EXISTS "hero_panel_copy_th" varchar,
  ADD COLUMN IF NOT EXISTS "systems_badge_en" varchar,
  ADD COLUMN IF NOT EXISTS "systems_badge_th" varchar,
  ADD COLUMN IF NOT EXISTS "systems_title_en" varchar,
  ADD COLUMN IF NOT EXISTS "systems_title_th" varchar,
  ADD COLUMN IF NOT EXISTS "systems_copy_en" varchar,
  ADD COLUMN IF NOT EXISTS "systems_copy_th" varchar,
  ADD COLUMN IF NOT EXISTS "systems_background_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL;

  CREATE TABLE IF NOT EXISTS "news_page" (
    "id" serial PRIMARY KEY,
    "background_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
    "badge_en" varchar,
    "badge_th" varchar,
    "title_en" varchar,
    "title_th" varchar,
    "subtitle_en" varchar,
    "subtitle_th" varchar,
    "archive_kicker_en" varchar,
    "archive_kicker_th" varchar,
    "archive_title_en" varchar,
    "archive_title_th" varchar,
    "archive_intro_en" varchar,
    "archive_intro_th" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "news_page"
  ADD COLUMN IF NOT EXISTS "background_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "badge_en" varchar,
  ADD COLUMN IF NOT EXISTS "badge_th" varchar,
  ADD COLUMN IF NOT EXISTS "title_en" varchar,
  ADD COLUMN IF NOT EXISTS "title_th" varchar,
  ADD COLUMN IF NOT EXISTS "subtitle_en" varchar,
  ADD COLUMN IF NOT EXISTS "subtitle_th" varchar,
  ADD COLUMN IF NOT EXISTS "archive_kicker_en" varchar,
  ADD COLUMN IF NOT EXISTS "archive_kicker_th" varchar,
  ADD COLUMN IF NOT EXISTS "archive_title_en" varchar,
  ADD COLUMN IF NOT EXISTS "archive_title_th" varchar,
  ADD COLUMN IF NOT EXISTS "archive_intro_en" varchar,
  ADD COLUMN IF NOT EXISTS "archive_intro_th" varchar,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  ADD COLUMN IF NOT EXISTS "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL;
`;

export const ENSURE_GLOBAL_SUPPORT_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS "site_settings_navigation_links" (
    "_order" integer NOT NULL DEFAULT 0,
    "id" varchar PRIMARY KEY,
    "label_en" varchar,
    "label_th" varchar,
    "href" varchar,
    "section_id" varchar,
    "visible" boolean DEFAULT true,
    "open_in_new_tab" boolean DEFAULT false,
    "_parent_id" integer REFERENCES "site_settings"("id") ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "site_settings_navigation_links_parent_idx"
    ON "site_settings_navigation_links" ("_parent_id");

  ALTER TABLE "site_settings_navigation_links"
  ADD COLUMN IF NOT EXISTS "_order" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "label_en" varchar,
  ADD COLUMN IF NOT EXISTS "label_th" varchar,
  ADD COLUMN IF NOT EXISTS "href" varchar,
  ADD COLUMN IF NOT EXISTS "section_id" varchar,
  ADD COLUMN IF NOT EXISTS "visible" boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "open_in_new_tab" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "_parent_id" integer;

  CREATE TABLE IF NOT EXISTS "site_settings_footer_groups" (
    "_order" integer NOT NULL DEFAULT 0,
    "id" varchar PRIMARY KEY,
    "title_en" varchar,
    "title_th" varchar,
    "description_en" varchar,
    "description_th" varchar,
    "_parent_id" integer REFERENCES "site_settings"("id") ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "site_settings_footer_groups_parent_idx"
    ON "site_settings_footer_groups" ("_parent_id");

  ALTER TABLE "site_settings_footer_groups"
  ADD COLUMN IF NOT EXISTS "_order" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "title_en" varchar,
  ADD COLUMN IF NOT EXISTS "title_th" varchar,
  ADD COLUMN IF NOT EXISTS "description_en" varchar,
  ADD COLUMN IF NOT EXISTS "description_th" varchar,
  ADD COLUMN IF NOT EXISTS "_parent_id" integer;

  CREATE TABLE IF NOT EXISTS "site_settings_footer_groups_links" (
    "_order" integer NOT NULL DEFAULT 0,
    "id" varchar PRIMARY KEY,
    "label_en" varchar,
    "label_th" varchar,
    "href" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "_parent_id" varchar REFERENCES "site_settings_footer_groups"("id") ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "site_settings_footer_groups_links_parent_idx"
    ON "site_settings_footer_groups_links" ("_parent_id");

  ALTER TABLE "site_settings_footer_groups_links"
  ADD COLUMN IF NOT EXISTS "_order" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "label_en" varchar,
  ADD COLUMN IF NOT EXISTS "label_th" varchar,
  ADD COLUMN IF NOT EXISTS "href" varchar,
  ADD COLUMN IF NOT EXISTS "open_in_new_tab" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "_parent_id" varchar;

  CREATE TABLE IF NOT EXISTS "homepage_features" (
    "_order" integer NOT NULL DEFAULT 0,
    "id" varchar PRIMARY KEY,
    "icon" varchar,
    "icon_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
    "preview_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
    "title_en" varchar,
    "title_th" varchar,
    "description_en" varchar,
    "description_th" varchar,
    "href" varchar,
    "cta_label_en" varchar,
    "cta_label_th" varchar,
    "_parent_id" integer REFERENCES "homepage"("id") ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "homepage_features_parent_idx"
    ON "homepage_features" ("_parent_id");

  ALTER TABLE "homepage_features"
  ADD COLUMN IF NOT EXISTS "_order" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "icon" varchar,
  ADD COLUMN IF NOT EXISTS "icon_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "preview_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "title_en" varchar,
  ADD COLUMN IF NOT EXISTS "title_th" varchar,
  ADD COLUMN IF NOT EXISTS "description_en" varchar,
  ADD COLUMN IF NOT EXISTS "description_th" varchar,
  ADD COLUMN IF NOT EXISTS "href" varchar,
  ADD COLUMN IF NOT EXISTS "cta_label_en" varchar,
  ADD COLUMN IF NOT EXISTS "cta_label_th" varchar,
  ADD COLUMN IF NOT EXISTS "_parent_id" integer;

  CREATE TABLE IF NOT EXISTS "game_guide_page_features" (
    "_order" integer NOT NULL DEFAULT 0,
    "id" varchar PRIMARY KEY,
    "icon" varchar,
    "icon_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
    "preview_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
    "title_en" varchar,
    "title_th" varchar,
    "description_en" varchar,
    "description_th" varchar,
    "href" varchar,
    "cta_label_en" varchar,
    "cta_label_th" varchar,
    "_parent_id" integer REFERENCES "game_guide_page"("id") ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "game_guide_page_features_parent_idx"
    ON "game_guide_page_features" ("_parent_id");

  ALTER TABLE "game_guide_page_features"
  ADD COLUMN IF NOT EXISTS "_order" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "icon" varchar,
  ADD COLUMN IF NOT EXISTS "icon_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "preview_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "title_en" varchar,
  ADD COLUMN IF NOT EXISTS "title_th" varchar,
  ADD COLUMN IF NOT EXISTS "description_en" varchar,
  ADD COLUMN IF NOT EXISTS "description_th" varchar,
  ADD COLUMN IF NOT EXISTS "href" varchar,
  ADD COLUMN IF NOT EXISTS "cta_label_en" varchar,
  ADD COLUMN IF NOT EXISTS "cta_label_th" varchar,
  ADD COLUMN IF NOT EXISTS "_parent_id" integer;

  CREATE TABLE IF NOT EXISTS "game_guide_page_pillars_en" (
    "_order" integer NOT NULL DEFAULT 0,
    "id" varchar PRIMARY KEY,
    "label" varchar,
    "_parent_id" integer REFERENCES "game_guide_page"("id") ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "game_guide_page_pillars_en_parent_idx"
    ON "game_guide_page_pillars_en" ("_parent_id");

  ALTER TABLE "game_guide_page_pillars_en"
  ADD COLUMN IF NOT EXISTS "_order" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "label" varchar,
  ADD COLUMN IF NOT EXISTS "_parent_id" integer;

  CREATE TABLE IF NOT EXISTS "game_guide_page_pillars_th" (
    "_order" integer NOT NULL DEFAULT 0,
    "id" varchar PRIMARY KEY,
    "label" varchar,
    "_parent_id" integer REFERENCES "game_guide_page"("id") ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "game_guide_page_pillars_th_parent_idx"
    ON "game_guide_page_pillars_th" ("_parent_id");

  ALTER TABLE "game_guide_page_pillars_th"
  ADD COLUMN IF NOT EXISTS "_order" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "label" varchar,
  ADD COLUMN IF NOT EXISTS "_parent_id" integer;

  ALTER TABLE "site_settings_navigation_links"
  ALTER COLUMN "id" TYPE varchar USING "id"::varchar;

  ALTER TABLE "site_settings_footer_groups"
  ALTER COLUMN "id" TYPE varchar USING "id"::varchar;

  ALTER TABLE "site_settings_footer_groups_links"
  ALTER COLUMN "id" TYPE varchar USING "id"::varchar;

  ALTER TABLE "site_settings_footer_groups_links"
  ALTER COLUMN "_parent_id" TYPE varchar USING "_parent_id"::varchar;

  ALTER TABLE "homepage_features"
  ALTER COLUMN "id" TYPE varchar USING "id"::varchar;

  ALTER TABLE "game_guide_page_features"
  ALTER COLUMN "id" TYPE varchar USING "id"::varchar;

  ALTER TABLE "game_guide_page_pillars_en"
  ALTER COLUMN "id" TYPE varchar USING "id"::varchar;

  ALTER TABLE "game_guide_page_pillars_th"
  ALTER COLUMN "id" TYPE varchar USING "id"::varchar;
`;

export const DROP_NEWS_EXCERPT_COLUMNS_SQL = `
  ALTER TABLE "news"
  DROP COLUMN IF EXISTS "excerpt_en";

  ALTER TABLE "news"
  DROP COLUMN IF EXISTS "excerpt_th";
`;

export const DROP_NEWS_EDITORIAL_COLUMNS_SQL = `
  ALTER TABLE "news"
  DROP COLUMN IF EXISTS "feature_on_home";

  ALTER TABLE "news"
  DROP COLUMN IF EXISTS "home_priority";

  ALTER TABLE "news"
  DROP COLUMN IF EXISTS "open_in_new_tab";

  ALTER TABLE "news"
  DROP COLUMN IF EXISTS "external_url";
`;
