// The one database interface every query helper takes. Both `pg.Pool` / `pg.PoolClient` and
// PGlite satisfy it, so helpers run against Supabase in the app and against PGlite in tests.
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

// Row types, one per table in supabase/migrations. Timestamps come back as `Date`, bigint
// columns as strings (pg's default) and jsonb as parsed JSON.

export type VehicleType = "car_light_truck" | "medium_duty" | "heavy_duty" | "trailer" | "fleet";
export type LeadStatus = "new" | "contacted" | "converted" | "closed";
export type PaymentRequestKind = "deposit" | "full" | "other";
export type PaymentRequestStatus = "open" | "processing" | "paid" | "canceled";
export type SignatureRequestStatus = "open" | "signed" | "voided";
export type SignatureMethod = "draw" | "type";
export type LinkSendChannel = "sms" | "email" | "copy" | "share";
export type PostStatus = "draft" | "published";

export interface CustomerRow {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  vehicle_type: VehicleType | null;
  service_slug: string | null;
  vehicle_down: boolean;
  message: string | null;
  status: LeadStatus;
  customer_id: string | null;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentRequestRow {
  id: string;
  customer_id: string;
  amount_cents: number;
  description: string;
  kind: PaymentRequestKind;
  internal_note: string | null;
  token: string;
  status: PaymentRequestStatus;
  stripe_checkout_session_id: string | null;
  stripe_checkout_expires_at: Date | null;
  stripe_payment_intent_id: string | null;
  amount_received_cents: number | null;
  receipt_url: string | null;
  viewed_at: Date | null;
  paid_at: Date | null;
  canceled_at: Date | null;
  last_payment_failed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentTemplateRow {
  id: string;
  slug: string;
  name: string;
  version: number;
  body_md: string;
  fields: unknown[];
  active: boolean;
  created_at: Date;
}

export interface SignatureRequestRow {
  id: string;
  customer_id: string;
  template_id: string;
  template_slug: string;
  template_name: string;
  template_version: number;
  field_values: Record<string, unknown>;
  rendered_blocks: unknown;
  content_sha256: string;
  token: string;
  status: SignatureRequestStatus;
  expires_at: Date;
  viewed_at: Date | null;
  consented_at: Date | null;
  signed_at: Date | null;
  voided_at: Date | null;
  signer_name: string | null;
  signer_email: string | null;
  signer_phone: string | null;
  signer_ip: string | null;
  signer_user_agent: string | null;
  consent_text_version: string | null;
  signature_method: SignatureMethod | null;
  signature_png: Uint8Array | null;
  pdf_path: string | null;
  pdf_sha256: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface LinkSendRow {
  id: string;
  payment_request_id: string | null;
  signature_request_id: string | null;
  channel: LinkSendChannel;
  sent_at: Date;
}

export interface PostRow {
  id: string;
  slug: string;
  title: string;
  service_slug: string | null;
  vehicle: string | null;
  city: string | null;
  summary: string;
  body_md: string;
  cover_image_id: string | null;
  status: PostStatus;
  published_at: Date | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PostImageRow {
  id: string;
  post_id: string;
  storage_path: string;
  alt: string;
  width: number | null;
  height: number | null;
  position: number;
  created_at: Date;
}

export interface StripeEventRow {
  id: string;
  type: string;
  received_at: Date;
}

export interface RateLimitHitRow {
  id: string;
  bucket: string;
  key_hash: string;
  created_at: Date;
}
