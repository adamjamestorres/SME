insert into customers (name, company, phone, email) values
  ('Avery Example', 'Example Fleet LLC', '+15550101', 'avery@example.com'),
  ('Blair Example', 'Example Hauling', '+15550102', 'blair@example.com'),
  ('Casey Example', null, '+15550103', 'casey@example.com'),
  ('Drew Example', 'Example Logistics', '+15550104', 'drew@example.com'),
  ('Emery Example', null, '+15550105', 'emery@example.com')
  on conflict do nothing;
insert into leads (name, phone, email, broken_down, status) values
  ('Dev Lead One', '+15550111', 'lead1@example.com', false, 'new'),
  ('Dev Lead Two', '+15550112', 'lead2@example.com', true, 'new'),
  ('Dev Lead Three', '+15550113', 'lead3@example.com', false, 'contacted');
insert into payment_requests (customer_id, amount_cents, description, kind, token)
select id, 25000, 'Development deposit', 'deposit', 'dev-open-payment' from customers where email = 'avery@example.com'
  on conflict (token) do nothing;
insert into payment_requests (customer_id, amount_cents, description, kind, token, status)
select id, 50000, 'Development paid invoice', 'full', 'dev-paid-payment', 'paid' from customers where email = 'blair@example.com'
  on conflict (token) do nothing;
