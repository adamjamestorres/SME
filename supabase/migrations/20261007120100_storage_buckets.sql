-- Storage buckets. `storage.buckets` already exists in Supabase; tests create a stub (test/db.ts).
--
-- portfolio: public job photos for the portfolio pages.
-- signed-documents: private signed PDFs, served only through short-lived signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio', 'portfolio', true, 5242880, array['image/jpeg']),
  ('signed-documents', 'signed-documents', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;
