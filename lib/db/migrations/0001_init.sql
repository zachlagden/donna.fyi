-- schema_migrations is created bootstrapped by migrate.ts before this runs

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id     bigint NOT NULL UNIQUE,
  github_login  text NOT NULL,
  display_name  text NOT NULL,
  role          text NOT NULL DEFAULT 'owner',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  key_hash      text NOT NULL,
  key_prefix    text NOT NULL,
  author_tag    text NOT NULL CHECK (author_tag IN ('donna', 'zach')),
  scopes        text[] NOT NULL DEFAULT '{posts:read,posts:write}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz
);

CREATE INDEX api_keys_active_idx ON api_keys (user_id) WHERE revoked_at IS NULL;
CREATE INDEX api_keys_prefix_idx ON api_keys (key_prefix) WHERE revoked_at IS NULL;

CREATE TABLE posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  summary         text,
  author_tag      text NOT NULL CHECK (author_tag IN ('donna', 'zach')),
  mdx_source      text NOT NULL,
  mdx_compiled    text NOT NULL,
  toc             jsonb NOT NULL DEFAULT '[]'::jsonb,
  reading_time_s  integer NOT NULL DEFAULT 0,
  published_at    timestamptz,
  scheduled_for   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX posts_published_idx ON posts (published_at DESC) WHERE published_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX posts_scheduled_idx ON posts (scheduled_for) WHERE scheduled_for IS NOT NULL AND published_at IS NULL;

CREATE TABLE revisions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id          uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  revision_number  integer NOT NULL,
  mdx_source       text NOT NULL,
  mdx_compiled     text NOT NULL,
  edited_by_key_id uuid REFERENCES api_keys(id),
  edited_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, revision_number)
);

CREATE INDEX revisions_post_idx ON revisions (post_id, revision_number DESC);

CREATE TABLE tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE post_tags (
  post_id  uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id   uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX post_tags_tag_idx ON post_tags (tag_id);

-- NextAuth tables (manually defined here so our migration owns them too)
CREATE TABLE nextauth_user (
  id            text PRIMARY KEY,
  name          text,
  email         text UNIQUE,
  email_verified timestamptz,
  image         text
);

CREATE TABLE nextauth_account (
  user_id              text NOT NULL REFERENCES nextauth_user(id) ON DELETE CASCADE,
  type                 text NOT NULL,
  provider             text NOT NULL,
  provider_account_id  text NOT NULL,
  refresh_token        text,
  access_token         text,
  expires_at           bigint,
  token_type           text,
  scope                text,
  id_token             text,
  session_state        text,
  PRIMARY KEY (provider, provider_account_id)
);

CREATE TABLE nextauth_session (
  session_token  text PRIMARY KEY,
  user_id        text NOT NULL REFERENCES nextauth_user(id) ON DELETE CASCADE,
  expires        timestamptz NOT NULL
);

CREATE TABLE nextauth_verification_token (
  identifier  text NOT NULL,
  token       text NOT NULL,
  expires     timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);
