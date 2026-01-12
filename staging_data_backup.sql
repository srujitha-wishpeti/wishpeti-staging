SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict Nuf1GakZdTfSlQsBdTMZwavVx3ULjthHQAAh4nv1po76PNftxZjTFgPc4xQs5mM

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '6172a88f-5e77-4668-a40d-5a7061417b4a', 'authenticated', 'authenticated', 'varshika.j@razorpay.com', NULL, '2025-12-23 14:22:29.514542+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-23 14:22:29.52297+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "108156618632679767548", "name": "Varshika Vasant Jadhav", "email": "varshika.j@razorpay.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocICKLE9L546xauVgL9Nlz4mt4L9jOtS0oj2MkMzhs_jeDyRpsk=s96-c", "full_name": "Varshika Vasant Jadhav", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocICKLE9L546xauVgL9Nlz4mt4L9jOtS0oj2MkMzhs_jeDyRpsk=s96-c", "provider_id": "108156618632679767548", "custom_claims": {"hd": "razorpay.com"}, "email_verified": true, "phone_verified": false}', NULL, '2025-12-23 14:22:29.436632+00', '2025-12-23 14:22:29.553883+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550b5fe8-45f0-496d-9640-6b6e7274ff74', 'authenticated', 'authenticated', 'support@wishpeti.com', '$2a$10$3LT4eu3ulaottysfU6E7m.T3BZIpzyCTyHg4XC73CrzUw9Q.Huxyq', '2025-12-23 09:34:13.085753+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-10 23:09:48.956827+00', '{"provider": "email", "providers": ["email", "google"]}', '{"iss": "https://accounts.google.com", "sub": "111660974515455747388", "name": "support wishpeti", "email": "support@wishpeti.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJgockDhnEy2uDExDzbeAEuPUEeo0DV_jDg6pRIyDHFJS8F9w=s96-c", "full_name": "support wishpeti", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJgockDhnEy2uDExDzbeAEuPUEeo0DV_jDg6pRIyDHFJS8F9w=s96-c", "provider_id": "111660974515455747388", "custom_claims": {"hd": "wishpeti.com"}, "email_verified": true, "phone_verified": false}', NULL, '2025-12-23 09:34:12.985768+00', '2026-01-12 04:27:31.216851+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', 'authenticated', 'authenticated', 'ygouthamkumar52@gmail.com', '$2a$10$Rc3.pNmtAlWxH7.W9T5vXujpkk/0kJxMHYJyNJgL.8/AXq025ZkHS', '2026-01-07 05:39:40.668262+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-07 05:39:40.676288+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "e146ff2f-1269-4b2e-9efc-5c51c57f2363", "email": "ygouthamkumar52@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-01-07 05:39:40.623733+00', '2026-01-11 06:55:39.794793+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '28d8b089-527b-4926-900d-5987b2cde09b', 'authenticated', 'authenticated', 'vbanda135@gmail.com', NULL, '2025-12-20 09:30:21.612239+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-27 06:15:51.597356+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "104224299113359243846", "name": "Vikranth Banda", "email": "vbanda135@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocKkFNXmreO16frl0k4jvlbafJKTG0IpLAJ4ReTdH8pWtJobNxUnEA=s96-c", "full_name": "Vikranth Banda", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocKkFNXmreO16frl0k4jvlbafJKTG0IpLAJ4ReTdH8pWtJobNxUnEA=s96-c", "provider_id": "104224299113359243846", "email_verified": true, "phone_verified": false}', NULL, '2025-12-20 09:30:21.595458+00', '2025-12-27 06:15:51.645742+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', 'authenticated', 'authenticated', 'gouthamkumaryg@gmail.com', NULL, '2025-12-20 01:29:57.58249+00', NULL, '', '2025-12-20 01:29:43.594067+00', '', NULL, '', '', NULL, '2025-12-20 01:29:57.585454+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "105704275799731796838", "name": "Y Goutham Kumar", "email": "gouthamkumaryg@gmail.com", "full_name": "Y Goutham Kumar", "provider_id": "105704275799731796838", "email_verified": true, "phone_verified": false}', NULL, '2025-12-20 01:29:43.579596+00', '2025-12-28 12:13:37.078717+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1f86df76-580c-49da-b1ae-330024d6d652', 'authenticated', 'authenticated', 'madhubandru@gmail.com', '$2a$10$QA.oKjTSwiV8Pzwr/oFxcuK3N35GZHNsxZHg3o8/nzywHMPMk9GRu', '2025-12-20 01:40:24.853061+00', NULL, '', '2025-12-20 01:39:55.817761+00', '', NULL, '', '', NULL, '2025-12-24 01:43:00.283269+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "1f86df76-580c-49da-b1ae-330024d6d652", "email": "madhubandru@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-12-20 01:39:55.791103+00', '2025-12-24 01:43:00.3134+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2eab1a46-27d9-40b3-9e60-4d85069e5aa7', 'authenticated', 'authenticated', 'shashik.0810@gmail.com', NULL, '2025-12-19 15:38:41.084537+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-19 23:48:17.504307+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "103122640703866916098", "name": "Shashi Reddy", "email": "shashik.0810@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocL3xx_OY_5voZ4OqfxNHcss14LnyuIE6b_Bq08-jMjdfXb-Mw=s96-c", "full_name": "Shashi Reddy", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocL3xx_OY_5voZ4OqfxNHcss14LnyuIE6b_Bq08-jMjdfXb-Mw=s96-c", "provider_id": "103122640703866916098", "email_verified": true, "phone_verified": false}', NULL, '2025-12-19 15:38:41.06785+00', '2025-12-19 23:48:17.507025+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', 'authenticated', 'authenticated', 'msrujitha@gmail.com', NULL, '2025-12-18 18:53:19.063599+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-01-12 14:42:22.844814+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "112882923553495393076", "name": "sr M", "email": "msrujitha@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocLeQOad447J8P406AiDHHLHX3A-fHoosS2KGKAGwXosYGwL_Q=s96-c", "full_name": "sr M", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLeQOad447J8P406AiDHHLHX3A-fHoosS2KGKAGwXosYGwL_Q=s96-c", "provider_id": "112882923553495393076", "email_verified": true, "phone_verified": false}', NULL, '2025-12-18 18:53:19.056223+00', '2026-01-12 14:42:22.848765+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('103122640703866916098', '2eab1a46-27d9-40b3-9e60-4d85069e5aa7', '{"iss": "https://accounts.google.com", "sub": "103122640703866916098", "name": "Shashi Reddy", "email": "shashik.0810@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocL3xx_OY_5voZ4OqfxNHcss14LnyuIE6b_Bq08-jMjdfXb-Mw=s96-c", "full_name": "Shashi Reddy", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocL3xx_OY_5voZ4OqfxNHcss14LnyuIE6b_Bq08-jMjdfXb-Mw=s96-c", "provider_id": "103122640703866916098", "email_verified": true, "phone_verified": false}', 'google', '2025-12-19 15:38:41.077109+00', '2025-12-19 15:38:41.07716+00', '2025-12-19 23:48:17.501728+00', '32fbe35d-a9a0-451c-a5c5-f24f57a2f68d'),
	('105704275799731796838', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', '{"iss": "https://accounts.google.com", "sub": "105704275799731796838", "name": "Y Goutham Kumar", "email": "gouthamkumaryg@gmail.com", "full_name": "Y Goutham Kumar", "provider_id": "105704275799731796838", "email_verified": true, "phone_verified": false}', 'google', '2025-12-20 01:29:57.576836+00', '2025-12-20 01:29:57.576889+00', '2025-12-20 01:29:57.576889+00', '2c7a3bba-2050-4285-9b6a-c06ddad85c22'),
	('1f86df76-580c-49da-b1ae-330024d6d652', '1f86df76-580c-49da-b1ae-330024d6d652', '{"sub": "1f86df76-580c-49da-b1ae-330024d6d652", "email": "madhubandru@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2025-12-20 01:39:55.810034+00', '2025-12-20 01:39:55.810081+00', '2025-12-20 01:39:55.810081+00', 'ce61ed49-7833-4a62-8b62-caa009d46b5a'),
	('550b5fe8-45f0-496d-9640-6b6e7274ff74', '550b5fe8-45f0-496d-9640-6b6e7274ff74', '{"sub": "550b5fe8-45f0-496d-9640-6b6e7274ff74", "email": "support@wishpeti.com", "email_verified": false, "phone_verified": false}', 'email', '2025-12-23 09:34:13.068185+00', '2025-12-23 09:34:13.068841+00', '2025-12-23 09:34:13.068841+00', 'fd163cea-0dc7-4fd7-a444-be90b067a6a3'),
	('104224299113359243846', '28d8b089-527b-4926-900d-5987b2cde09b', '{"iss": "https://accounts.google.com", "sub": "104224299113359243846", "name": "Vikranth Banda", "email": "vbanda135@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocKkFNXmreO16frl0k4jvlbafJKTG0IpLAJ4ReTdH8pWtJobNxUnEA=s96-c", "full_name": "Vikranth Banda", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocKkFNXmreO16frl0k4jvlbafJKTG0IpLAJ4ReTdH8pWtJobNxUnEA=s96-c", "provider_id": "104224299113359243846", "email_verified": true, "phone_verified": false}', 'google', '2025-12-20 09:30:21.602923+00', '2025-12-20 09:30:21.602974+00', '2025-12-27 06:15:51.588686+00', 'd3508989-3699-4178-8745-a7c3cd2644ad'),
	('108156618632679767548', '6172a88f-5e77-4668-a40d-5a7061417b4a', '{"iss": "https://accounts.google.com", "sub": "108156618632679767548", "name": "Varshika Vasant Jadhav", "email": "varshika.j@razorpay.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocICKLE9L546xauVgL9Nlz4mt4L9jOtS0oj2MkMzhs_jeDyRpsk=s96-c", "full_name": "Varshika Vasant Jadhav", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocICKLE9L546xauVgL9Nlz4mt4L9jOtS0oj2MkMzhs_jeDyRpsk=s96-c", "provider_id": "108156618632679767548", "custom_claims": {"hd": "razorpay.com"}, "email_verified": true, "phone_verified": false}', 'google', '2025-12-23 14:22:29.501063+00', '2025-12-23 14:22:29.501123+00', '2025-12-23 14:22:29.501123+00', 'aafeeb9f-2a9d-4c52-a060-15943f7a28ac'),
	('111660974515455747388', '550b5fe8-45f0-496d-9640-6b6e7274ff74', '{"iss": "https://accounts.google.com", "sub": "111660974515455747388", "name": "support wishpeti", "email": "support@wishpeti.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJgockDhnEy2uDExDzbeAEuPUEeo0DV_jDg6pRIyDHFJS8F9w=s96-c", "full_name": "support wishpeti", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJgockDhnEy2uDExDzbeAEuPUEeo0DV_jDg6pRIyDHFJS8F9w=s96-c", "provider_id": "111660974515455747388", "custom_claims": {"hd": "wishpeti.com"}, "email_verified": true, "phone_verified": false}', 'google', '2025-12-23 16:39:19.467078+00', '2025-12-23 16:39:19.467639+00', '2026-01-10 23:09:48.950651+00', '8806d6c9-933b-4032-8187-3b271fe5b058'),
	('e146ff2f-1269-4b2e-9efc-5c51c57f2363', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"sub": "e146ff2f-1269-4b2e-9efc-5c51c57f2363", "email": "ygouthamkumar52@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-01-07 05:39:40.657728+00', '2026-01-07 05:39:40.657783+00', '2026-01-07 05:39:40.657783+00', 'a42ee2a0-a24d-4d80-aca1-db5e5f1529d3'),
	('112882923553495393076', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"iss": "https://accounts.google.com", "sub": "112882923553495393076", "name": "sr M", "email": "msrujitha@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocLeQOad447J8P406AiDHHLHX3A-fHoosS2KGKAGwXosYGwL_Q=s96-c", "full_name": "sr M", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLeQOad447J8P406AiDHHLHX3A-fHoosS2KGKAGwXosYGwL_Q=s96-c", "provider_id": "112882923553495393076", "email_verified": true, "phone_verified": false}', 'google', '2025-12-18 18:53:19.060378+00', '2025-12-18 18:53:19.060423+00', '2026-01-12 14:42:22.842005+00', '15a31029-15bc-4826-957b-50e845551811');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('ffbf17c4-df9b-46d1-98f0-029c4f635521', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '2026-01-07 05:39:40.676385+00', '2026-01-11 06:55:39.805056+00', NULL, 'aal1', NULL, '2026-01-11 06:55:39.80433', 'Mozilla/5.0 (Linux; U; Android 15; en-gb; RMX5116 Build/AP3A.240617.008) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.72 Mobile Safari/537.36 HeyTapBrowser/45.13.6.1', '122.172.81.162', NULL, NULL, NULL, NULL, NULL),
	('f626b5b8-6a5b-4a34-93ca-e33b44dbf937', '2eab1a46-27d9-40b3-9e60-4d85069e5aa7', '2025-12-19 23:48:17.504392+00', '2025-12-19 23:48:17.504392+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1 Ddg/18.6', '108.230.211.237', NULL, NULL, NULL, NULL, NULL),
	('f51c4a21-f48c-4349-b586-b3eed3eb7d6b', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', '2025-12-20 01:29:57.58554+00', '2025-12-28 12:13:37.087985+00', NULL, 'aal1', NULL, '2025-12-28 12:13:37.087868', 'Mozilla/5.0 (Linux; U; Android 15; en-gb; RMX5116 Build/AP3A.240617.008) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.72 Mobile Safari/537.36 HeyTapBrowser/45.13.4.4.2beta', '106.221.204.46', NULL, NULL, NULL, NULL, NULL),
	('a8deaccf-556b-4761-a434-0f97fb0f6132', '6172a88f-5e77-4668-a40d-5a7061417b4a', '2025-12-23 14:22:29.523945+00', '2025-12-23 14:22:29.523945+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '101.0.62.58', NULL, NULL, NULL, NULL, NULL),
	('08834f67-501e-4ac7-ad43-7968646737bc', '2eab1a46-27d9-40b3-9e60-4d85069e5aa7', '2025-12-19 18:22:25.178818+00', '2025-12-19 18:22:25.178818+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1 Ddg/18.6', '108.230.211.237', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('ffbf17c4-df9b-46d1-98f0-029c4f635521', '2026-01-07 05:39:40.709369+00', '2026-01-07 05:39:40.709369+00', 'password', 'e033b088-5dae-4d1d-80da-d62252685575'),
	('f626b5b8-6a5b-4a34-93ca-e33b44dbf937', '2025-12-19 23:48:17.507477+00', '2025-12-19 23:48:17.507477+00', 'oauth', '135332fa-d1fc-453c-b37e-5db6e91054cd'),
	('a8deaccf-556b-4761-a434-0f97fb0f6132', '2025-12-23 14:22:29.55445+00', '2025-12-23 14:22:29.55445+00', 'oauth', '23e18f1b-f19b-41de-b355-b46958717f38'),
	('f51c4a21-f48c-4349-b586-b3eed3eb7d6b', '2025-12-20 01:29:57.590923+00', '2025-12-20 01:29:57.590923+00', 'oauth', 'ec51d635-36b1-42eb-bb47-cf897461232b'),
	('08834f67-501e-4ac7-ad43-7968646737bc', '2025-12-19 18:22:25.184155+00', '2025-12-19 18:22:25.184155+00', 'oauth', '62cf047b-f464-405e-a33d-c1fc86e13400');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 346, '3ykhqr3dfv52', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', true, '2025-12-24 08:44:43.759278+00', '2025-12-25 14:57:46.224722+00', 'oqwthf6m3pim', 'f51c4a21-f48c-4349-b586-b3eed3eb7d6b'),
	('00000000-0000-0000-0000-000000000000', 204, 'j6hu5blepvvk', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', true, '2025-12-20 13:18:36.891267+00', '2025-12-22 00:36:55.222804+00', 'iayqwtcvtih2', 'f51c4a21-f48c-4349-b586-b3eed3eb7d6b'),
	('00000000-0000-0000-0000-000000000000', 525, '5aao3krlmd7f', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', true, '2026-01-07 05:39:40.687221+00', '2026-01-07 07:17:05.011373+00', NULL, 'ffbf17c4-df9b-46d1-98f0-029c4f635521'),
	('00000000-0000-0000-0000-000000000000', 546, 'qieedhr2fbb4', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', true, '2026-01-10 12:09:40.387988+00', '2026-01-11 06:55:39.764256+00', 'jeghbl3fhwhf', 'ffbf17c4-df9b-46d1-98f0-029c4f635521'),
	('00000000-0000-0000-0000-000000000000', 584, 'vre3ebmvotv5', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', false, '2026-01-11 06:55:39.781337+00', '2026-01-11 06:55:39.781337+00', 'qieedhr2fbb4', 'ffbf17c4-df9b-46d1-98f0-029c4f635521'),
	('00000000-0000-0000-0000-000000000000', 253, 's2exaatnyjpu', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', true, '2025-12-22 00:36:55.244493+00', '2025-12-24 06:51:58.042348+00', 'j6hu5blepvvk', 'f51c4a21-f48c-4349-b586-b3eed3eb7d6b'),
	('00000000-0000-0000-0000-000000000000', 166, 'sgazx5zsfyd5', '2eab1a46-27d9-40b3-9e60-4d85069e5aa7', false, '2025-12-19 23:48:17.50566+00', '2025-12-19 23:48:17.50566+00', NULL, 'f626b5b8-6a5b-4a34-93ca-e33b44dbf937'),
	('00000000-0000-0000-0000-000000000000', 345, 'oqwthf6m3pim', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', true, '2025-12-24 06:51:58.067283+00', '2025-12-24 08:44:43.731423+00', 's2exaatnyjpu', 'f51c4a21-f48c-4349-b586-b3eed3eb7d6b'),
	('00000000-0000-0000-0000-000000000000', 373, 'jkfxbfy6z55n', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', true, '2025-12-25 14:57:46.241096+00', '2025-12-28 12:13:37.063856+00', '3ykhqr3dfv52', 'f51c4a21-f48c-4349-b586-b3eed3eb7d6b'),
	('00000000-0000-0000-0000-000000000000', 458, 'tjbs3zh6hzaf', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', false, '2025-12-28 12:13:37.071391+00', '2025-12-28 12:13:37.071391+00', 'jkfxbfy6z55n', 'f51c4a21-f48c-4349-b586-b3eed3eb7d6b'),
	('00000000-0000-0000-0000-000000000000', 528, 'ukxrk37x4vzn', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', true, '2026-01-07 07:17:05.015719+00', '2026-01-08 06:03:04.717802+00', '5aao3krlmd7f', 'ffbf17c4-df9b-46d1-98f0-029c4f635521'),
	('00000000-0000-0000-0000-000000000000', 172, 'elnry6bonk6b', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', true, '2025-12-20 01:29:57.587337+00', '2025-12-20 02:49:37.660986+00', NULL, 'f51c4a21-f48c-4349-b586-b3eed3eb7d6b'),
	('00000000-0000-0000-0000-000000000000', 539, 'h7l6jcbky5zb', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', true, '2026-01-08 06:03:04.738164+00', '2026-01-08 07:13:31.48562+00', 'ukxrk37x4vzn', 'ffbf17c4-df9b-46d1-98f0-029c4f635521'),
	('00000000-0000-0000-0000-000000000000', 318, 'noa2x7vrqwdx', '6172a88f-5e77-4668-a40d-5a7061417b4a', false, '2025-12-23 14:22:29.536896+00', '2025-12-23 14:22:29.536896+00', NULL, 'a8deaccf-556b-4761-a434-0f97fb0f6132'),
	('00000000-0000-0000-0000-000000000000', 540, 'vapormvfucwg', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', true, '2026-01-08 07:13:31.510178+00', '2026-01-08 10:25:34.129402+00', 'h7l6jcbky5zb', 'ffbf17c4-df9b-46d1-98f0-029c4f635521'),
	('00000000-0000-0000-0000-000000000000', 541, 'i7dunbunenm4', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', true, '2026-01-08 10:25:34.147904+00', '2026-01-09 16:21:11.965124+00', 'vapormvfucwg', 'ffbf17c4-df9b-46d1-98f0-029c4f635521'),
	('00000000-0000-0000-0000-000000000000', 542, 'jeghbl3fhwhf', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', true, '2026-01-09 16:21:11.979206+00', '2026-01-10 12:09:40.368115+00', 'i7dunbunenm4', 'ffbf17c4-df9b-46d1-98f0-029c4f635521'),
	('00000000-0000-0000-0000-000000000000', 150, 'dq6jbzekmuij', '2eab1a46-27d9-40b3-9e60-4d85069e5aa7', false, '2025-12-19 18:22:25.182406+00', '2025-12-19 18:22:25.182406+00', NULL, '08834f67-501e-4ac7-ad43-7968646737bc'),
	('00000000-0000-0000-0000-000000000000', 180, 'iayqwtcvtih2', 'be0763c5-9a4c-433b-bd5b-d4f7cea56562', true, '2025-12-20 02:49:37.662852+00', '2025-12-20 13:18:36.86109+00', 'elnry6bonk6b', 'f51c4a21-f48c-4349-b586-b3eed3eb7d6b');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: creator_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."creator_profiles" ("id", "email", "display_name", "created_at", "address_line1", "address_line2", "city", "state", "country", "full_name", "postal_code", "updated_at", "username", "bio", "avatar_url", "banner_url", "country_code", "currency", "shipping_address", "withdrawable_balance", "bank_linked", "payout_destination_id", "payout_details", "phone", "social_links", "is_profile_claimed", "is_founding_member", "is_verified") VALUES
	('e146ff2f-1269-4b2e-9efc-5c51c57f2363', 'ygouthamkumar52@gmail.com', 'Goutham', '2026-01-07 05:39:40.62336+00', '13th ward Sai nagar ', NULL, 'Bellary', 'Karnataka', NULL, 'GOUTHAMkUMAR ', '583121', '2026-01-07 05:39:40.62336+00', 'gouthamkumar', '', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/avatars/e146ff2f-1269-4b2e-9efc-5c51c57f2363/avatar_0.8518174641117244.jpeg', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/banners/e146ff2f-1269-4b2e-9efc-5c51c57f2363/banner_0.5131967876310914.jpg', 'IN', 'INR', NULL, 0, true, NULL, '{"id": "7996955769-2@ybl", "type": "upi"}', NULL, '{}', true, false, true),
	('ed08926e-1fb3-452f-a8dd-c9790e7187b7', 'msrujitha@gmail.com', 'Srujitha', '2025-12-20 09:37:32.948412+00', 's', NULL, 'Bellary', 'Karnataka', 'India', 'Srujitha Mullapudi', '583104', '2026-01-11 22:04:04.591+00', 'srujitha', 'Founder @WishPeti', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/avatars/ed08926e-1fb3-452f-a8dd-c9790e7187b7/avatar_0.15625283262996414.jpeg', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/banners/ed08926e-1fb3-452f-a8dd-c9790e7187b7/banner_0.22313644774012364.jpg', 'IN', 'INR', NULL, 0, false, NULL, NULL, '5', '{"spotify": "https://instagram.com/srujitha", "twitter": "https://instagram.com/srujitha", "youtube": "https://instagram.com/srujitha", "instagram": "https://instagram.com/srujitha_mullapudi"}', true, true, true),
	('fcda4175-ab3e-42dd-9c91-f9d4e1a61a94', NULL, 'Payal Gaming', '2026-01-10 22:14:19.844939+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-10 22:14:19.844939+00', 'payalgaming', 'Mobile Streamer of the year - 2024
iQOO Brand Ambassador', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/avatars/payal.png', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/banners/payal_banner.png', 'IN', 'INR', NULL, 0, false, NULL, NULL, NULL, '{"youtube": "https://www.youtube.com/@PayalGaming", "instagram": "https://www.instagram.com/payalgamingg"}', false, false, false),
	('213d4b2b-518b-49df-beea-3703e2a8d29e', NULL, 'Tanya Khanijow', '2026-01-10 22:14:19.844939+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-10 22:14:19.844939+00', 'tanyakhanijow', 'Hi, I''m Tanya and I love to travel! I''m a vlogger from India, a digital nomad, a sustainability advocate (as much as possible realistically) and an entrepreneur. Subscribe for the best stories from around the world, that''ll make you realise that people all over, are just the same - finding meaning in the mundane rigours of life. :) 
', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/avatars/tanya.png', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/banners/tanya_banner.png', 'IN', 'INR', NULL, 0, false, NULL, NULL, NULL, '{"youtube": "https://www.youtube.com/@TanyaKhanijow", "instagram": "https://www.instagram.com/tanyakhanijow"}', false, false, false),
	('28d8b089-527b-4926-900d-5987b2cde09b', 'vbanda135@gmail.com', NULL, '2025-12-20 09:30:21.590875+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-20 09:30:21.590875+00', NULL, NULL, NULL, NULL, 'IN', 'INR', NULL, 0, false, NULL, NULL, NULL, '{}', true, false, false),
	('1f86df76-580c-49da-b1ae-330024d6d652', 'madhubandru@gmail.com', 'madhub407', '2025-12-20 01:39:58.982723+00', '13444 Gran Bay pkwy', NULL, 'Jacksonville', 'FL', 'USA', 'Madhu B', '32258', '2025-12-20 01:39:58.982723+00', 'madhub407', 'More power to you', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/avatars/1f86df76-580c-49da-b1ae-330024d6d652/avatar_0.4369668112209054.jpeg', NULL, 'IN', 'INR', NULL, 0, false, NULL, NULL, NULL, '{}', true, false, false),
	('6172a88f-5e77-4668-a40d-5a7061417b4a', 'varshika.j@razorpay.com', NULL, '2025-12-23 14:22:29.326886+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 14:22:29.326886+00', NULL, NULL, NULL, NULL, 'IN', 'INR', NULL, 0, false, NULL, NULL, NULL, '{}', true, false, false),
	('550b5fe8-45f0-496d-9640-6b6e7274ff74', 'support@wishpeti.com', 'Support@wishpeti', '2025-12-23 09:34:12.984218+00', '7813 Anderson Ln, Apt 202', NULL, 'Jessup', 'MD', 'USA', 'Srujitha Mullapudi', '32259', '2025-12-23 09:34:12.984218+00', 'support', '', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/avatars/550b5fe8-45f0-496d-9640-6b6e7274ff74/avatar_0.5810347457757881.webp', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/banners/550b5fe8-45f0-496d-9640-6b6e7274ff74/banner_0.056163002505418835.jpg', 'IN', 'INR', NULL, 0, false, NULL, NULL, NULL, '{}', true, true, true),
	('0b213ef1-2876-4890-a6c9-072701f5298f', '', 'Samay Raina', '2026-01-10 22:14:19.844939+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-11 19:46:19.259+00', 'samayraina', 'I do it for the laugh emoji ', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/avatars/samay.png', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/banners/samay_banner.png', 'IN', 'INR', NULL, 0, false, NULL, NULL, NULL, '{"youtube": "https://www.youtube.com/@SamayRainaOfficial", "instagram": "https://www.instagram.com/maisamayhoon"}', false, false, false),
	('082adcc1-93d0-46db-a94b-87ac4759a3f9', '', 'Nancy Tyagi', '2026-01-10 22:14:19.844939+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-11 19:50:01.52+00', 'nancytyagi', 'Fashion is inherent💅

Forbes30U30', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/avatars/nancy.png', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/banners/nancy_banner.png', 'IN', 'INR', NULL, 0, false, NULL, NULL, NULL, '{"youtube": "https://www.youtube.com/@nancytyagi_", "instagram": "https://www.instagram.com/nancytyagi___"}', false, false, false),
	('459833ab-e625-48fe-ad94-810fcf7103b8', '', 'Lakhshya Speaks', '2026-01-10 22:14:19.844939+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-12 04:31:49.673+00', 'lakhshyaspeaks', 'Society, Culture, and Politics through an Ambedkarite Left Lens.
Educate. Agitate. Organise. ✊🏻', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/avatars/lakhshya.png', 'https://ogarisvzvwajgzlaoami.supabase.co/storage/v1/object/public/banners/lakhshya_banner.png', 'IN', 'INR', NULL, 0, false, NULL, NULL, NULL, '{"youtube": "https://www.youtube.com/@lakhshyaspeaks", "instagram": "https://www.instagram.com/lakhshya_speaks"}', false, true, false);


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."wishlist_items" ("id", "creator_id", "url", "title", "price", "original_price", "discount", "image", "brand", "store", "category", "variants", "custom_options", "specifications", "rating", "reviews", "availability", "created_at", "updated_at", "currency_code", "selected_size", "selected_color", "notes", "quantity", "is_crowdfund", "amount_raised", "status", "priority_level", "is_general_fund", "image_url") VALUES
	('1b0d203e-b6ba-4e30-a8c2-20351201b4ee', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', 'https://www.amazon.in/dp/B01LTI1GWW?ref=altParentAsins_treatment_text_from_Birthday_to_NewYear&gpo=10000&th=1', 'Amazon Pay Gift Card - New Year (Digital)', 11800, NULL, NULL, 'https://m.media-amazon.com/images/I/51yvgVwnV+L._SX342_SY445_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-02 06:51:35.386729+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 1, true, 0, 'available', 3, false, NULL),
	('18195125-1022-4390-9bb6-570a82caf015', '550b5fe8-45f0-496d-9640-6b6e7274ff74', 'https://www.amazon.in/Cuzor-Doorstep-Warranty-Supports-Routers/dp/B0CFB4DSST/ref=pb_allspark_purchase_sims_desktop_d_sccl_4_14/523-2472601-0275254?pd_rd_w=nfvIc&content-id=amzn1.sym.bf23bdc7-6f20-4210-b1c5-da3acd88edba&pf_rd_p=bf23bdc7-6f20-4210-b1c5-da3acd88edba&pf_rd_r=FJH5RBKRMGB30G4CR08X&pd_rd_wg=N9uUj&pd_rd_r=33dafd93-e405-4feb-a41e-d48b6fc32d53&pd_rd_i=B0CFB4DSST&th=1', 'Add to your order', 2595.25, NULL, NULL, 'https://m.media-amazon.com/images/I/21OUHd9cmjL._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-07 05:59:12.210927+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 1, false, 0, 'available', 3, false, NULL),
	('347c7eee-00c7-46be-9fee-5b5cf485dac0', '082adcc1-93d0-46db-a94b-87ac4759a3f9', 'https://amazon.in/dp/example1', 'Industrial Juki Overlock Machine', 48000, NULL, NULL, NULL, 'Juki', 'Amazon India', 'Fashion', '{}', '[]', '[]', NULL, NULL, NULL, '2026-01-10 22:16:27.354107+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, NULL, 1, true, 0, 'available', 1, false, 'https://m.media-amazon.com/images/I/71dYm2Y-1rL.jpg'),
	('e5c0bb4d-65d1-4a1b-9f63-64f8b23d17ec', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', 'https://www.amazon.in/dp/B0BD34Q9C5?ref=altParentAsins_treatment_text_from_OtherFestivals_to_Birthday&th=1&gpo=10000', 'Amazon Pay Gift Card - Birthday (Digital)', 11800, NULL, NULL, 'https://m.media-amazon.com/images/I/412x349rfqL._SX342_SY445_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-02 06:18:04.757894+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 1, true, 0, 'available', 3, false, NULL),
	('5773da9b-5991-493b-96ad-24f2ee576f98', '550b5fe8-45f0-496d-9640-6b6e7274ff74', 'https://www.amazon.in/dp/B0DP53TLM1/ref=sspa_dk_rhf_search_pt_sub_0/?_encoding=UTF8&ie=UTF8&psc=1&sp_csd=d2lkZ2V0TmFtZT1zcF9yaGZfc2VhcmNoX3BlcnNvbmFsaXplZA%3D%3D&sp_cr=ZAZ&aref=OZlONMrgX7&pd_rd_w=udiXr&content-id=amzn1.sym.825f90a0-9d57-4d27-b26a-71a54ebe3ed2&pf_rd_p=825f90a0-9d57-4d27-b26a-71a54ebe3ed2&pf_rd_r=D5DZ9VGH02YB7PPCAZSG&pd_rd_wg=oDiRv&pd_rd_r=2c8ec381-400a-47f1-a3db-1492607e5063&ref_=sspa_dk_rhf_search_pt_sub', 'Add to your order', 4719.87, NULL, NULL, 'https://m.media-amazon.com/images/I/31wUHA+CVkL._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-07 06:00:58.035481+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 1, true, 0, 'available', 1, false, NULL),
	('78640e65-212f-4747-9ff7-dbe2e564d7a7', '550b5fe8-45f0-496d-9640-6b6e7274ff74', 'https://www.amazon.in/amazon-basics-Headphones-Cancelling-Microphone/dp/B0DG2PVL35/ref=sr_1_8?crid=1FCEGFHRKCW2T&dib=eyJ2IjoiMSJ9.46IrJAECB1-lrK7WM8fmxbtXk0qaW1qYY-Be_xOJTmwk_YrBRWVNv5VrcSylNKQm13BjhTmtmSg7Vh1PPtSLfMrSB6Aaa0BjW-QeT12JsSd51T9g2vxGDUaDGjGQ7ObR8Le1AHCWoRmWGZM-m8d-K6NakCbFpeRQSs_T2Aj4XAuTasLUZkz9kdFKcXC6oBocP4qSnuUE_VGHbNSLrMsyvUTTw3_TRJ47KrMYfD_6RWQ.Q2yOlWJ7ECuxQG3Dwa050T1s9tfEGJbLgWPh4qx_IkU&dib_tag=se&keywords=headset%2Bwith%2Bmic%2Bfor%2Blaptops&qid=1767765482&sprefix=headset%2Bwith%2B%2Caps%2C389&sr=8-8&th=1', 'Amazon Basics Pro Series Wired USB On Ear Headset with Mic | 40 mm Driver | Computer/PC or Laptop Headphone | Noise Cancellation Microphone | in-line Control for Home, Office, Teams or Zoom, Black', 2477.1, NULL, NULL, 'https://m.media-amazon.com/images/I/41Vyq2FdT7L._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-07 05:58:24.004653+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 2, false, 0, 'available', 1, false, NULL),
	('d872325d-3a1f-40b5-b5c8-2ca119c711a0', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', 'https://amzn.in/d/dJxuzbw', 'Add to your order', 21828.82, NULL, NULL, 'https://m.media-amazon.com/images/I/319jaFDFh5L._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-07 06:15:55.739299+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 2, true, 0, 'available', 3, false, NULL),
	('e5e911e3-3e58-415f-afa5-46b5c6b9c867', 'fcda4175-ab3e-42dd-9c91-f9d4e1a61a94', 'https://www.amazon.in/Elgato-Stream-Deck-XL-customizable/dp/B07RL8H55Z/ref=sr_1_2?dib=eyJ2IjoiMSJ9.ifz13eYSr5Ybwy1TPYS7OZv6o16-hv1Vt1vKigUIajErxAYCRTjpD1sa7o3NzMY78a4xxQgV3rjs3CLf7O_AwVQgID6HzzWh40wP9LDdKcarGyxDN9P335SVtc8uvJaH6gLURWmfGGa7iLFkL_zttoZASbyZHwCcxGsftCnZf8-eD7t_yVklxxkADkn-unesaumumzjuHz9QKQnCPxiPw_LHltCzNeBqnl6vWeWzeyupfgTpkzu9bEJ8ZxnI2LWo2slwBTrJ5tOqOX61_TTmBer06xzYQyrQc6lsNAhkjHc.vQuQu7lTsCiIQvi8gMY0I7nkPRGXys4-DUepCMEXOao&dib_tag=se&keywords=Elgato%2BStream%2BDeck%2BMK.2&nsdOptOutParam=true&qid=1768089204&sr=8-2&th=1', 'Elgato Stream Deck XL - Advanced Stream Control with 32 customizable LCD keys, for Windows 10 and macOS 10.13 or later', 30351.96, NULL, NULL, 'https://m.media-amazon.com/images/I/41J69GO1bDL._SX342_SY445_QL70_FMwebp_.jpg', 'Elgato', '', 'Gaming', '{}', '[]', '[]', NULL, NULL, NULL, '2026-01-10 22:16:27.354107+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, NULL, 1, false, 0, 'available', 2, false, ''),
	('a63baefd-239f-481d-abbc-a0a6184ee45e', '550b5fe8-45f0-496d-9640-6b6e7274ff74', 'https://www.amazon.in/DJI-Microphone-Intelligent-Cancelling-Recording/dp/B0CFZX734J/ref=sr_1_5?dib=eyJ2IjoiMSJ9.jGQUjNcEzLL6dUF68BfHj8AZW4CK4fSPzYUMOkx9wrdutDJ8sm5EPr1HuJRs_ELBq3fLG42J4OEVLJJzBOlsMCE-RBJk80g-yTwBU7iF6j6BndQF_o3GGoq8DbD8--Vabq5RDrz1sYkz4I8pha3pieOxL1OZz3w7x-1Fn1VYXV53LtHPUE4Q7U2k61vuxrcHf0939N5iVV5QTvXfDeC0ocatjUQSnAcN1-yTEfh67QX2aYxO1j4saJ9T62s9fJvNYudlixAEwn0ds56zXUWgJGp7px6urX8epG17LOW5PTY.HfmCyyyJh8nGcLBKVD-oXH_dn4JmU-hnx0rxMYdVPII&dib_tag=se&keywords=DJI+Mic+2+%282+TX+%2B+1+RX%29&nsdOptOutParam=true&qid=1768086549&sr=8-5', 'DJI MIC 2 (2 TX + 1 RX + Charging Case), All-in-One Wireless Microphones, Intelligent Noise Cancelling, 32-Bit Float Internal Recording, 250M (820 Ft.) Range, Microphone for iPhone, Android, Camera', 26172.4, NULL, NULL, 'https://m.media-amazon.com/images/I/31xP6pRjtQL._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-10 23:09:59.420664+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 1, false, 0, 'available', 3, false, NULL),
	('32077771-b34e-4dd2-b789-2d01dc5ac185', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', 'https://www.amazon.in/Elgato-Stream-Deck-XL-customizable/dp/B07RL8H55Z/ref=sr_1_2?dib=eyJ2IjoiMSJ9.ifz13eYSr5Ybwy1TPYS7OZv6o16-hv1Vt1vKigUIajErxAYCRTjpD1sa7o3NzMY78a4xxQgV3rjs3CLf7O_AwVQgID6HzzWh40wP9LDdKcarGyxDN9P335SVtc8uvJaH6gLURWmfGGa7iLFkL_zttoZASbyZHwCcxGsftCnZf8-eD7t_yVklxxkADkn-unesaumumzjuHz9QKQnCPxiPw_LHltCzNeBqnl6vWeWzeyupfgTpkzu9bEJ8ZxnI2LWo2slwBTrJ5tOqOX61_TTmBer06xzYQyrQc6lsNAhkjHc.vQuQu7lTsCiIQvi8gMY0I7nkPRGXys4-DUepCMEXOao&dib_tag=se&keywords=Elgato%2BStream%2BDeck%2BMK.2&nsdOptOutParam=true&qid=1768089204&sr=8-2&th=1', 'Elgato Stream Deck XL - Advanced Stream Control with 32 customizable LCD keys, for Windows 10 and macOS 10.13 or later', 30351.96, NULL, NULL, 'https://m.media-amazon.com/images/I/41J69GO1bDL._SX342_SY445_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-10 23:54:12.658053+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 1, false, 0, 'available', 3, false, NULL),
	('645b3860-3e3d-43c5-bbfc-1f41fd1d5049', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', 'https://www.amazon.in/Nikon-20-9MP-Camera-18-140mm-3-5-5-6G/dp/B06Y5RTN1T/ref=sr_1_1?crid=2GAT8OH9A8PZ1&dib=eyJ2IjoiMSJ9.8soU92MZR9xIE5CUKQbKlPhcPqiJ2_J_4OV27QkuEVJwJnBZDrtJ1p6d9-bN_F9y3blEfgVdoeYH6YKd8b94hJrE3anjWL7NVmxkwX5ysoGj112jrvzdVcbI2P6e384gY-Gifd7OaM5gl4QNuX1rLpSsg1fFE2se8d4YkdLwedTYL-uoAEXx-9qa1X0Blib03_UYCslhrlGIDt1BVGrYYkk5JE3GPCw1ijSM0L_pqxw.3hEeJT4E5rPo91KjQUhoGd1Z9pSVoOPjfFbrUU2qVVU&dib_tag=se&keywords=camera+dslr&qid=1766926438&sprefix=camera+dsl%2Caps%2C380&sr=8-1', 'Add to your order', 106188.2, NULL, NULL, 'https://m.media-amazon.com/images/I/51NR+Auf92L._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-01 21:18:13.987158+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 1, true, 0, 'available', 3, false, NULL),
	('2c4d6ab9-c4b5-43e9-97fb-53ccba515276', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', 'https://www.amazon.in/dp/B0F493G266?ref=cm_sw_r_cso_cp_apan_dp_BAPDXAPENY6QK8FYJ4DC&ref_=cm_sw_r_cso_cp_apan_dp_BAPDXAPENY6QK8FYJ4DC&social_share=cm_sw_r_cso_cp_apan_dp_BAPDXAPENY6QK8FYJ4DC', 'Add to your order', 4246.82, NULL, NULL, 'https://m.media-amazon.com/images/I/41AdoEnHszL._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-07 16:05:36.47208+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 2, false, 0, 'available', 3, false, NULL),
	('e664b950-f5b0-4434-9310-21ffdfa19b58', '550b5fe8-45f0-496d-9640-6b6e7274ff74', 'https://www.amazon.in/Xech-Digital-Sleepers-Wireless-Boyfriend/dp/B0FYXCDCBG/ref=sr_1_24_sspa?crid=2A9C96L8ZD84C&dib=eyJ2IjoiMSJ9._5po9D-VX5ugIfoeNTUfNgxNSnQV8JV4XpaycFLQ5ggmWMmokzTQF0R68wdfFWPxT53-1jJuHc7c7gZUSPJdbFPJBv56CvH8AFxrBwOtLezpycSLTQ6tTHW_qjgCFzM3XURsXREqZWhCXNRWe1Uq1JErEr3o-JUnCN-y1nqdd9EG9jRgShwvxngOixwNcD4sK2Z5x942-eSa2fQoYmVEze1NnIBPdBLqg_GehWKwY5N3ljK7H-6M-thbnIp8sub-Y5fx5FUVUjuc8ggoISIRU-CBWYh2jBlD6fOVN_WxMfQ.LuQ_n436mKC4BJNFNDX66IU5wFbrJqQ_nQbnV07OQDg&dib_tag=se&keywords=customer+support+gifts&qid=1767765579&sprefix=customer+support+gift%2Caps%2C374&sr=8-24-spons&aref=xPgO3Xc7fl&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&psc=1', 'Add to your order', 1119.86, NULL, NULL, 'https://m.media-amazon.com/images/I/313-8WvAonL._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-07 06:00:17.282104+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 1, true, 0, 'available', 3, false, NULL),
	('48ee4d6c-277a-476d-9797-29dee4aae1a0', '213d4b2b-518b-49df-beea-3703e2a8d29e', 'https://www.amazon.in/DJI-Microphone-Intelligent-Cancelling-Recording/dp/B0CFZX734J/ref=sr_1_5?dib=eyJ2IjoiMSJ9.jGQUjNcEzLL6dUF68BfHj8AZW4CK4fSPzYUMOkx9wrdutDJ8sm5EPr1HuJRs_ELBq3fLG42J4OEVLJJzBOlsMCE-RBJk80g-yTwBU7iF6j6BndQF_o3GGoq8DbD8--Vabq5RDrz1sYkz4I8pha3pieOxL1OZz3w7x-1Fn1VYXV53LtHPUE4Q7U2k61vuxrcHf0939N5iVV5QTvXfDeC0ocatjUQSnAcN1-yTEfh67QX2aYxO1j4saJ9T62s9fJvNYudlixAEwn0ds56zXUWgJGp7px6urX8epG17LOW5PTY.HfmCyyyJh8nGcLBKVD-oXH_dn4JmU-hnx0rxMYdVPII&dib_tag=se&keywords=DJI+Mic+2+%282+TX+%2B+1+RX%29&nsdOptOutParam=true&qid=1768086549&sr=8-5', 'DJI MIC 2 (2 TX + 1 RX + Charging Case), All-in-One Wireless Microphones, Intelligent Noise Cancelling, 32-Bit Float Internal Recording, 250M (820 Ft.) Range, Microphone for iPhone, Android, Camera', 26172.4, NULL, NULL, 'https://m.media-amazon.com/images/I/31xP6pRjtQL._SY300_SX300_QL70_FMwebp_.jpg', 'DJI', 'amazon.in', 'Travel', '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-10 22:16:27.354107+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, NULL, 1, true, 0, 'available', 2, false, ''),
	('a15963ac-8303-4149-a911-0ed58f30bdd0', '0b213ef1-2876-4890-a6c9-072701f5298f', 'https://www.amazon.in/Dgt-Digital-Chess-Clock-Red/dp/B0033Q44FA/ref=sr_1_4?crid=1ZFRXMJ06EHR1&dib=eyJ2IjoiMSJ9.BTFUtJ7xakMkw3ERnmCz9xwGEtJo-QAW6ZEVHPLAnbG_kpTU1glisdL9apaeZchiEESsUwvFwwEQdsrLTlg0romvo0xHLywL2bcZEDmgO6Tvf2LSeLsJt7mndYJeKtClnSYwoMj-TuOiVStmj55KL4aHjK6KXdAsuc3bdTXIovx1nCqLD3H91v4tKEiRBLEWM139d6lNOFXd52be5UgpDxvJdvn5YeU6SdkYa-hhjrbX4I0v2_2abYNxVuhZbOCHbs1pZ-voNPNHofEzL0gdVm6F9ImniL7RABXluHCUEo8.bnvJwPuT6_fkyA248DOQf1rlmVdVcTbrctleXmJSW_c&dib_tag=se&keywords=DGT+North+American+Chess+Clock&nsdOptOutParam=true&qid=1768089588&sprefix=elgato+stream+deck+mk.2%2Caps%2C728&sr=8-4', 'DGT Philos Dgt 2010 Abs Plastic Digital Chess Timer Clock,For 6+ Years,Multicoloured', 4073, NULL, NULL, 'https://m.media-amazon.com/images/I/412gTO3JTxL._SX300_SY300_QL70_FMwebp_.jpg', 'DGT', 'amazon India', 'Sports', '{}', '[]', '[]', NULL, NULL, NULL, '2026-01-10 22:16:27.354107+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, NULL, 1, false, 0, 'available', 1, false, 'https://m.media-amazon.com/images/I/61+9E-W-J2L.jpg'),
	('9e6962a6-833f-430b-b1f7-c0a1c447afa1', '459833ab-e625-48fe-ad94-810fcf7103b8', 'https://www.amazon.in/DIGIMORE-D-440-Microphone-Adjustable-Suspension/dp/B0C247GCNL/ref=sr_1_2_sspa?crid=2PDB9NX8K856B&dib=eyJ2IjoiMSJ9.FbM2E0RNUGx9QOuevbAn652RdBZheBT3eb3WIntm-IVaqCvu2X7rayI83LQXSDH_ZWlfT-m7FY_wmCXH6oQnVHwWc9UBOt2EijeQY3XYK-XlpL88hM2BpYAIcbo5Z3mvvvaqp2NNlrcnEPruZS8cKEwnWP1WGuCubI472zRlQgKaauEeZiqpjsmU_WPDOqt07b2ADO9P_nLwtz1MMf9XeYCsU13XaertPmzxI4QXyH0.3dkGptvz9tn809CCMkdQnQX5S0Fb1RL4yimCVJ8RAls&dib_tag=se&keywords=youtuber+tools&nsdOptOutParam=true&qid=1768192603&sprefix=youtuber+to%2Caps%2C356&sr=8-2-spons&aref=tpQrb82bcc&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1', 'DIGIMORE Condenser Microphone Kit with Studio Headphones, Live Sound Card, Boom Arm Stand, Shock Mount and Pop Filter Ideal for Recording, Starmaker Singing, Live Streaming and Podcast Setup (D-440)', 6488.82, NULL, NULL, 'https://m.media-amazon.com/images/I/51qDAb8fziL._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-12 04:37:07.593362+00', '2026-01-12 06:35:08.425102+00', 'INR', NULL, NULL, '', 1, false, 0, 'available', 3, false, NULL),
	('9b7766ef-f5f5-4f48-a5d5-86b4843051ad', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', 'https://www.amazon.in/Wembley-Rechargeable-Wireless-Bluetooth-Microphone/dp/B0DRPCR5VK/?_encoding=UTF8&pd_rd_w=U2FWz&content-id=amzn1.sym.5fdfed10-663e-40d6-810e-08029e8435c0%3Aamzn1.symc.96b8365e-3b12-433f-a173-648d41788658&pf_rd_p=5fdfed10-663e-40d6-810e-08029e8435c0&pf_rd_r=NQCJ3Q8AST9AS7662H4B&pd_rd_wg=5DMjm&pd_rd_r=7ffe1574-14a6-4a5e-8a0c-c4f611557cd3&ref_=pd_hp_d_btf_ci_mcx_mr_hp_atf_m&th=1', 'Wembley Rechargeable Karaoke Mic with Speaker for Singing | Wireless Mini Portable Bluetooth Speaker with Microphone & LED Lights | Cute Birthday Gift for Kids Musical Toys for Boys, Girls and Adults', 627.66, NULL, NULL, 'https://m.media-amazon.com/images/I/41Mtcy5E4bL._SY300_SX300_QL70_FMwebp_.jpg', NULL, NULL, NULL, '{"selectedSize": "", "selectedColor": ""}', '[]', '[]', NULL, NULL, NULL, '2026-01-09 16:57:22.049815+00', '2026-01-12 14:58:45.111281+00', 'INR', NULL, NULL, '', 7, false, 0, 'available', 3, false, NULL);


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: global_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."global_settings" ("id", "last_updated", "rates") VALUES
	('current_rates', '2026-01-12 06:00:02.638+00', '{"AED": 0.040661, "AFN": 0.73174, "ALL": 0.919208, "AMD": 4.226116, "ANG": 0.019818, "AOA": 10.240946, "ARS": 16.078783, "AUD": 0.016558, "AWG": 0.019818, "AZN": 0.018845, "BAM": 0.018635, "BBD": 0.022143, "BDT": 1.354628, "BGN": 1.434667, "BHD": 0.004163, "BIF": 32.902913, "BMD": 0.011072, "BND": 0.014267, "BOB": 0.076879, "BRL": 0.05958, "BSD": 0.011072, "BTN": 1, "BWP": 0.15142, "BYN": 0.032501, "BZD": 0.022143, "CAD": 0.01541, "CDF": 23.866197, "CHF": 0.008879, "CLF": 0.000251, "CLP": 9.934976, "CNH": 0.077339, "CNY": 0.077721, "COP": 41.239337, "CRC": 5.513539, "CUP": 0.265719, "CVE": 1.050603, "CZK": 0.231598, "DJF": 1.967662, "DKK": 0.071082, "DOP": 0.703806, "DZD": 1.442018, "EGP": 0.523383, "ERN": 0.166075, "ETB": 1.72556, "EUR": 0.009528, "FJD": 0.025262, "FKP": 0.008269, "FOK": 0.071082, "GBP": 0.008269, "GEL": 0.029884, "GGP": 0.008269, "GHS": 0.118884, "GIP": 0.008269, "GMD": 0.818959, "GNF": 96.876656, "GTQ": 0.085013, "GYD": 2.318057, "HKD": 0.086393, "HNL": 0.292365, "HRK": 0.071789, "HTG": 1.45015, "HUF": 3.675811, "IDR": 186.295278, "ILS": 0.03488, "IMP": 0.008269, "INR": 1, "IQD": 14.545064, "IRR": 469.577707, "ISK": 1.402849, "JEP": 0.008269, "JMD": 1.758931, "JOD": 0.00785, "JPY": 1.750567, "KES": 1.429804, "KGS": 0.969113, "KHR": 44.592105, "KID": 0.016558, "KMF": 4.687458, "KRW": 16.146499, "KWD": 0.003401, "KYD": 0.009226, "KZT": 5.657197, "LAK": 240.592831, "LBP": 990.911428, "LKR": 3.429322, "LRD": 1.988634, "LSL": 0.18301, "LYD": 0.060111, "MAD": 0.102445, "MDL": 0.186334, "MGA": 50.58209, "MKD": 0.584577, "MMK": 23.257317, "MNT": 39.45467, "MOP": 0.088985, "MRU": 0.443412, "MUR": 0.517747, "MVR": 0.171333, "MWK": 19.282255, "MXN": 0.19957, "MYR": 0.045144, "MZN": 0.705667, "NAD": 0.18301, "NGN": 15.786321, "NIO": 0.408003, "NOK": 0.112024, "NPR": 1.6, "NZD": 0.019321, "OMR": 0.004257, "PAB": 0.011072, "PEN": 0.037281, "PGK": 0.047337, "PHP": 0.656228, "PKR": 3.108334, "PLN": 0.040123, "PYG": 73.141382, "QAR": 0.040301, "RON": 0.048459, "RSD": 1.117225, "RUB": 0.875621, "RWF": 16.15571, "SAR": 0.041519, "SBD": 0.089352, "SCR": 0.164844, "SDG": 4.954678, "SEK": 0.102237, "SGD": 0.014267, "SHP": 0.008269, "SLE": 0.263911, "SLL": 263.910297, "SOS": 6.322761, "SRD": 0.421937, "SSP": 52.398451, "STN": 0.233435, "SYP": 1.245216, "SZL": 0.18301, "THB": 0.348156, "TJS": 0.102375, "TMT": 0.038818, "TND": 0.032012, "TOP": 0.026581, "TRY": 0.478245, "TTD": 0.075272, "TVD": 0.016558, "TWD": 0.350429, "TZS": 27.832212, "UAH": 0.477958, "UGX": 39.889731, "USD": 0.011072, "UYU": 0.432423, "UZS": 135.395957, "VES": 3.657808, "VND": 288.954753, "VUV": 1.340211, "WST": 0.030493, "XAF": 6.249944, "XCD": 0.029893, "XCG": 0.019818, "XDR": 0.008102, "XOF": 6.249944, "XPF": 1.136993, "YER": 2.642537, "ZAR": 0.183329, "ZMW": 0.215395, "ZWG": 0.284744, "ZWL": 0.284745}');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."orders" ("id", "wishlist_item_id", "buyer_email", "payment_status", "gift_status", "created_at", "razorpay_payment_id", "total_amount", "buyer_name", "items", "creator_id", "admin_notes", "currency_code", "subtotal", "platform_fee", "estimated_tax", "actual_shipping_paid", "actual_purchase_cost", "tracking_number", "exchange_rate_at_payment", "invoice_url", "is_crowdfund", "item_id", "carrier_name", "is_crowdfund_master", "buyer_message", "is_surprise", "surprise_amount_in_inr", "buyer_anonymous") VALUES
	('e3950886-c7e2-4a4e-ba4b-ada96600f489', NULL, 'msrujitha@gmail.com', 'paid', 'pending', '2026-01-12 08:01:11.89034+00', 'pay_S2tTJ58nW29li5', 627.66, 's', NULL, 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', NULL, 'INR', 0.00, 0.00, 0.00, 0.00, NULL, NULL, 1.0000, NULL, false, '9b7766ef-f5f5-4f48-a5d5-86b4843051ad', NULL, false, '', false, 0, false),
	('688faf57-223a-492a-8e99-df8229035503', NULL, 'msrujitha@gmail.com', 'paid', 'pending', '2026-01-12 14:58:44.75955+00', 'pay_S30aOWKNFmvSi5', 627.66, 'sr', NULL, 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', NULL, 'INR', 0.00, 0.00, 0.00, 0.00, NULL, NULL, 1.0000, NULL, false, '9b7766ef-f5f5-4f48-a5d5-86b4843051ad', NULL, false, '', false, 0, false);


--
-- Data for Name: session_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."session_logs" ("id", "created_at", "user_session_id", "event_type", "username_viewed", "metadata", "user_agent") VALUES
	('1b10f10c-351d-41e6-aa24-1f0b32a74c9c', '2026-01-01 18:37:30.263173+00', 'a8ea91d0-7473-4ba6-a675-de33be9f03c3', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-01T18:37:30.482Z", "cart_total": 6.899749999999999}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('ea4bde9f-ac4e-4416-9435-1a5cb3cc04e8', '2026-01-02 06:23:09.112008+00', '1c44fe0b-e2d3-4f44-af9e-f12fcb2fccee', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-02T06:23:09.373Z", "cart_total": 100}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('ea3eabfb-f8cd-48ba-b896-3511f1c72b27', '2026-01-06 02:24:52.926755+00', 'e7ff5c8b-96df-4b41-93a5-7c2fb8b5611d', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-06T02:24:52.850Z", "cart_total": 100}', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1'),
	('a68a9b6f-726a-4ee8-8ffe-dabd164f6950', '2026-01-07 07:07:05.172716+00', '07ef8dd5-1903-460c-bff3-d89e482c8853', 'contribution_to_crowdfund', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/gouthamkumar", "amount": 2255.3, "timestamp": "2026-01-07T07:07:05.149Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('142dbe0a-8250-41bb-8776-692c43217105', '2026-01-07 16:03:31.037468+00', '07ef8dd5-1903-460c-bff3-d89e482c8853', 'contribution_to_crowdfund', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/gouthamkumar", "amount": 4247.18, "timestamp": "2026-01-07T16:03:31.158Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('2cc94025-8e2a-4335-993d-29639d5f3a5b', '2026-01-07 16:45:22.097796+00', 'cd7d3a0e-7590-41a4-bb44-c972f1673915', 'contribution_to_crowdfund', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/srujitha", "amount": 646.15, "timestamp": "2026-01-07T16:45:22.365Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('ab49227f-615d-4f80-8cc9-dfa9576721ae', '2026-01-07 19:40:48.852165+00', 'cd7d3a0e-7590-41a4-bb44-c972f1673915', 'checkout_initiated', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T19:40:49.380Z", "cart_total": 4246.82}', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'),
	('68bfe36a-8e75-4c00-a558-287418a474fb', '2026-01-07 19:58:15.33315+00', 'eedc6986-6011-486d-8d5f-8fdda9c78a57', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T19:58:15.125Z", "cart_total": 6.958719599999999}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'),
	('78e09553-e710-4c93-ac11-e9e21e9ec996', '2026-01-08 12:19:34.117122+00', 'a466f369-9dbe-4854-a2c1-44874352e2aa', 'checkout_initiated', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-08T12:19:33.634Z", "cart_total": 47.24162568}', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1'),
	('1dea5f5e-c496-4932-a5da-bf6776728cb4', '2026-01-11 20:40:03.390706+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T20:40:03.425Z", "cart_total": 6.960673679999999}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('f0b757d3-27d1-4709-abbd-5524e6cb99f9', '2026-01-11 21:10:26.535795+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T21:10:26.541Z", "cart_total": 45.177716}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('ab8e692f-fcd0-42a6-b2b2-138c12ec22b8', '2026-01-11 21:43:55.864838+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T21:43:55.039Z", "cart_total": 7.16254808}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('4f74073c-4482-407a-85fa-9d5dc17d3c50', '2026-01-01 21:20:01.647082+00', '0607b561-3e9a-44c2-817e-b1c42a2c20b9', 'contribution_to_crowdfund', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/srujitha", "amount": 9090.91, "timestamp": "2026-01-01T21:20:01.597Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('554819fb-a1fe-4a4b-925a-486b8e2b8acc', '2026-01-02 11:04:51.513851+00', 'ead30a84-e67b-42d9-830e-3c7395f27d37', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-02T11:04:51.390Z", "cart_total": 100}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('eb933d84-58d0-4d38-8151-47b5865dd917', '2026-01-06 02:25:04.201857+00', 'e7ff5c8b-96df-4b41-93a5-7c2fb8b5611d', 'payment_modal_closed', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "reason": "User cancelled", "timestamp": "2026-01-06T02:25:04.056Z"}', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1'),
	('96a0c621-4923-4643-89f0-f1e3ac1bd8f8', '2026-01-07 07:19:31.662909+00', '07ef8dd5-1903-460c-bff3-d89e482c8853', 'contribution_to_crowdfund', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/gouthamkumar", "amount": 4247.18, "timestamp": "2026-01-07T07:19:31.632Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('8c704472-d454-4d4b-90e7-f9b8772ff767', '2026-01-07 16:06:09.152472+00', '07ef8dd5-1903-460c-bff3-d89e482c8853', 'checkout_initiated', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T16:06:09.596Z", "cart_total": 47.0759997}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('d5857584-cab4-477e-955c-32f55d6e252d', '2026-01-07 17:10:54.765862+00', 'cd7d3a0e-7590-41a4-bb44-c972f1673915', 'contribution_to_crowdfund', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/srujitha", "amount": 646.15, "timestamp": "2026-01-07T17:10:54.650Z"}', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'),
	('4d96d67b-d9e9-4f26-850f-e86ad6398143', '2026-01-07 19:44:39.945607+00', '28ee0bb3-d3b2-46c2-8275-d47b08228720', 'checkout_initiated', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-07T19:44:40.485Z", "cart_total": 47.0759997}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('002e9733-0c88-4099-b4cb-6af0fd838a6b', '2026-01-07 19:59:38.427977+00', 'eedc6986-6011-486d-8d5f-8fdda9c78a57', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T19:59:37.704Z", "cart_total": 6.958719599999999}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'),
	('0a8e5485-27a7-41d0-a135-1b45d9609b8f', '2025-12-30 16:37:52.196256+00', 'a8ea91d0-7473-4ba6-a675-de33be9f03c3', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2025-12-30T16:37:52.627Z", "cart_total": 6.899060025000001}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('c2d59e13-ebc3-4d52-b0ec-8be5e82c24f1', '2026-01-08 12:23:36.871645+00', 'a466f369-9dbe-4854-a2c1-44874352e2aa', 'contribution_to_crowdfund', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/gouthamkumar", "amount": 2247.39, "timestamp": "2026-01-08T12:23:36.826Z"}', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1'),
	('a2fb69ff-a5af-4825-9122-a4b9c8654bea', '2026-01-11 20:43:15.925185+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T20:43:15.948Z", "cart_total": 6.960673679999999}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('2c17085d-d18e-4e43-a2eb-c5a7fae78090', '2026-01-11 21:12:57.343633+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T21:12:57.325Z", "cart_total": 7.16254808}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('80f062f6-d3c5-44d4-952b-1a8db90dd576', '2026-01-11 21:48:31.592256+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T21:48:31.670Z", "cart_total": 7.16254808}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('0c41270e-37ed-4449-a0e1-0308255b27fa', '2026-01-02 06:19:18.013605+00', '1c44fe0b-e2d3-4f44-af9e-f12fcb2fccee', 'contribution_to_crowdfund', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/srujitha", "amount": 9090.91, "timestamp": "2026-01-02T06:19:17.357Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('d9b43e7a-c18d-4b6d-bfd5-85fd3119301c', '2026-01-02 06:19:44.017649+00', '1c44fe0b-e2d3-4f44-af9e-f12fcb2fccee', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-02T06:19:44.274Z", "cart_total": 100}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('b3e6ded6-1c37-477c-a199-2a518ccb2006', '2026-01-02 11:06:18.148755+00', 'ead30a84-e67b-42d9-830e-3c7395f27d37', 'payment_modal_closed', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "reason": "User cancelled", "timestamp": "2026-01-02T11:06:18.169Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('1d07879f-9c7d-4b66-97c1-01f0b06ffc95', '2026-01-07 06:09:41.150815+00', 'e9c9dc11-ecff-48d4-a860-af7b3f172abd', 'contribution_to_crowdfund', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "http://localhost:5173/gouthamkumar", "amount": 2255.3, "timestamp": "2026-01-07T06:09:41.197Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('0a98224e-f033-42c8-9bc6-2d019c9f394f', '2026-01-07 08:22:12.259482+00', '07ef8dd5-1903-460c-bff3-d89e482c8853', 'contribution_to_crowdfund', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/gouthamkumar", "amount": 2255.3, "timestamp": "2026-01-07T08:22:11.646Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('0f29609d-4666-46d3-aa7d-d36bedfca3b7', '2026-01-07 16:30:25.767215+00', 'eedc6986-6011-486d-8d5f-8fdda9c78a57', 'checkout_initiated', '550b5fe8-45f0-496d-9640-6b6e7274ff74', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T16:30:25.662Z", "cart_total": 27.458653499999997}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'),
	('2ee1efa2-614d-4de1-8f31-d96d3628841a', '2026-01-07 17:54:02.874527+00', '059ac803-e04e-4407-aed9-391ab5de3d51', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-07T17:54:03.172Z", "cart_total": 6.958719599999999}', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'),
	('7227600a-eed6-4c69-9254-a6b409d8c424', '2026-01-07 19:50:19.884948+00', 'eedc6986-6011-486d-8d5f-8fdda9c78a57', 'checkout_initiated', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T19:50:19.714Z", "cart_total": 47.0759997}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'),
	('dfba055f-f4d9-42b5-a36d-f5e47f8db8ba', '2026-01-07 20:09:11.491308+00', '28ee0bb3-d3b2-46c2-8275-d47b08228720', 'checkout_initiated', '550b5fe8-45f0-496d-9640-6b6e7274ff74', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-07T20:09:11.145Z", "cart_total": 27.458653499999997}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('1d5de031-2026-43e4-a63b-08e47d25fb8b', '2026-01-11 07:05:04.229352+00', 'fee56f95-e61f-46a9-80cd-31f61108cf51', 'contribution_to_crowdfund', 'a3f77565-eae9-4b67-8412-508a6795435a', '{"url": "https://wishpeti.com/nancytyagi", "amount": 1000, "timestamp": "2026-01-11T07:05:03.838Z"}', 'Mozilla/5.0 (Linux; U; Android 15; en-gb; RMX5116 Build/AP3A.240617.008) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.72 Mobile Safari/537.36 HeyTapBrowser/45.13.6.1'),
	('96bc00bd-728e-49bb-a14e-ae9d1ebc95a3', '2026-01-11 20:46:51.998143+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T20:46:52.040Z", "cart_total": 6.960673679999999}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('51f229fa-f588-4bfd-8d99-b93119f6123c', '2026-01-11 21:28:29.451655+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T21:28:29.408Z", "cart_total": 6.9620047199999995}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('0e9e6aea-1d7e-469a-8dd9-3ad8f6583489', '2026-01-02 06:19:30.378019+00', '1c44fe0b-e2d3-4f44-af9e-f12fcb2fccee', 'surprise_fund_intent', 'srujitha', '{"url": "https://wishpeti.com/srujitha", "amount": 100, "timestamp": "2026-01-02T06:19:30.565Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('a8b3bd56-cd7c-4893-b172-b211aa55de1f', '2026-01-02 19:15:33.745426+00', 'cd1987d4-c9ff-4e8b-aa48-4d859e39a536', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-02T19:15:33.631Z", "cart_total": 6.972530320000001}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'),
	('c8ffe8f5-edcf-4d39-888f-2b6d7d5b0a18', '2026-01-07 06:38:34.642817+00', 'e9c9dc11-ecff-48d4-a860-af7b3f172abd', 'contribution_to_crowdfund', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "http://localhost:5173/gouthamkumar", "amount": 1991.88, "timestamp": "2026-01-07T06:38:34.677Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('3bdc498a-f64e-425d-bdd2-4d713c2541de', '2026-01-07 08:23:41.678989+00', '07ef8dd5-1903-460c-bff3-d89e482c8853', 'checkout_initiated', '550b5fe8-45f0-496d-9640-6b6e7274ff74', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T08:23:41.709Z", "cart_total": 12.413648099999998}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('e3224079-3864-4d0a-b3db-91dfeb0e25be', '2025-12-30 16:37:58.808623+00', 'a8ea91d0-7473-4ba6-a675-de33be9f03c3', 'payment_modal_closed', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "reason": "User cancelled", "timestamp": "2025-12-30T16:37:59.196Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('f9d9e6ed-2120-471a-9ee0-0fe1726917ea', '2026-01-07 16:32:24.619189+00', '07ef8dd5-1903-460c-bff3-d89e482c8853', 'checkout_initiated', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T16:32:25.073Z", "cart_total": 47.0759997}', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36 Edg/143.0.0.0'),
	('b4cb11ae-ab58-4cf0-9bfe-4d1bb926242b', '2026-01-07 19:01:37.731838+00', '059ac803-e04e-4407-aed9-391ab5de3d51', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-07T19:01:38.098Z", "cart_total": 6.958719599999999}', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'),
	('19a28221-da10-4bab-ada4-da1f0d0e1233', '2026-01-07 19:51:33.829266+00', 'eedc6986-6011-486d-8d5f-8fdda9c78a57', 'checkout_initiated', '550b5fe8-45f0-496d-9640-6b6e7274ff74', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T19:51:33.611Z", "cart_total": 27.458653499999997}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'),
	('d051bb6a-63d7-490f-9187-c07cbdac29c6', '2026-01-07 20:13:01.779907+00', '28ee0bb3-d3b2-46c2-8275-d47b08228720', 'checkout_initiated', '550b5fe8-45f0-496d-9640-6b6e7274ff74', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-07T20:13:02.347Z", "cart_total": 27.458653499999997}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('793aa765-3b33-4461-9a05-ce0729173c48', '2026-01-11 20:24:40.665314+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T20:24:40.534Z", "cart_total": 6.960673679999999}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('8e5df8d1-9076-4951-88ed-f7f7786b4d04', '2026-01-11 20:52:54.086216+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T20:52:54.120Z", "cart_total": 6.960673679999999}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('0dfda7ca-22dc-4175-ab3d-11ccf49b72ac', '2026-01-11 21:35:56.202217+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T21:35:56.218Z", "cart_total": 7.16254808}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('6f296a5e-cd0d-4544-820b-e9a0fd7e117b', '2026-01-02 06:23:01.005261+00', '1c44fe0b-e2d3-4f44-af9e-f12fcb2fccee', 'surprise_fund_intent', 'srujitha', '{"url": "https://wishpeti.com/srujitha", "amount": 100, "timestamp": "2026-01-02T06:23:01.202Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('d60fb7be-c02f-4240-9629-88b4d8b96965', '2026-01-02 06:23:21.49092+00', '1c44fe0b-e2d3-4f44-af9e-f12fcb2fccee', 'payment_modal_closed', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "reason": "User cancelled", "timestamp": "2026-01-02T06:23:21.697Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('e7a0c151-1494-45b5-8ae3-8ad3c8fd98af', '2026-01-06 02:24:43.830645+00', 'e7ff5c8b-96df-4b41-93a5-7c2fb8b5611d', 'surprise_fund_intent', 'srujitha', '{"url": "https://wishpeti.com/srujitha", "amount": 100, "timestamp": "2026-01-06T02:24:43.516Z"}', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1'),
	('ecc830bd-f234-40fd-811b-67f527bbf590', '2026-01-07 06:47:41.85332+00', 'e9c9dc11-ecff-48d4-a860-af7b3f172abd', 'contribution_to_crowdfund', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "http://localhost:5173/gouthamkumar", "amount": 21829.5, "timestamp": "2026-01-07T06:47:41.851Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('dffc8df7-11ab-4375-b430-a7a14aee4c12', '2026-01-07 06:47:51.212857+00', 'e9c9dc11-ecff-48d4-a860-af7b3f172abd', 'surprise_fund_intent', 'gouthamkumar', '{"url": "http://localhost:5173/gouthamkumar", "amount": 25, "timestamp": "2026-01-07T06:47:51.242Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('1d57a084-e136-4b80-a040-a89bef60ea5f', '2026-01-07 09:18:51.106683+00', 'e9a725b8-bca3-438f-9dea-80cb6be31720', 'contribution_to_crowdfund', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/gouthamkumar", "amount": 4247.18, "timestamp": "2026-01-07T09:18:51.207Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('03bc3f1f-6f13-4460-86f0-504ef31f59e4', '2026-01-07 16:40:11.712152+00', 'eedc6986-6011-486d-8d5f-8fdda9c78a57', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T16:40:11.623Z", "cart_total": 6.958719599999999}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'),
	('edad0cb5-cf26-47f1-9e0e-adf2a0f9b839', '2026-01-07 19:39:31.906638+00', 'eedc6986-6011-486d-8d5f-8fdda9c78a57', 'checkout_initiated', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T19:39:31.720Z", "cart_total": 47.0759997}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'),
	('3778b258-f660-4ed8-91d5-23faa1d113ef', '2026-01-07 19:53:08.376796+00', 'eedc6986-6011-486d-8d5f-8fdda9c78a57', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-07T19:53:08.211Z", "cart_total": 6.958719599999999}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'),
	('cb34d4eb-33b8-4bfe-9788-c223ebef8490', '2026-01-08 12:16:51.319152+00', 'a466f369-9dbe-4854-a2c1-44874352e2aa', 'checkout_initiated', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-08T12:16:51.175Z", "cart_total": 47.24162568}', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1'),
	('6be823a3-01e3-4a3a-b6e3-1ef787b4a167', '2026-01-11 20:32:57.655222+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T20:32:57.699Z", "cart_total": 6.960673679999999}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('a2c4bb07-8caa-49d0-bb4b-64bedcd7378e', '2026-01-11 21:02:09.580974+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T21:02:09.493Z", "cart_total": 6.9620047199999995}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('973de59f-4644-4815-be6b-f9028668bd55', '2026-01-11 21:40:33.076824+00', 'b32ab231-9b5c-4476-ac4d-92c2e4b8b252', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "timestamp": "2026-01-11T21:40:33.142Z", "cart_total": 7.16254808}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('276edf9b-10a3-407f-90f2-d292e02e1736', '2025-12-30 16:37:34.684345+00', 'a8ea91d0-7473-4ba6-a675-de33be9f03c3', 'payment_modal_closed', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "http://localhost:5173/cart", "reason": "User cancelled", "timestamp": "2025-12-30T16:37:35.068Z"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('6fbc369a-88cc-48bd-9888-202aed09a8c4', '2026-01-12 07:15:02.947128+00', '23173616-7265-4c15-8e86-b8a05319f5a0', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-12T07:15:02.876Z", "cart_total": 5.980344479999999}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('3f218dff-9ec0-45ed-887c-31a6c642b009', '2026-01-12 07:21:19.453614+00', '72be6c78-6cc0-45a5-986b-a53e76f2dccd', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-12T07:21:19.402Z", "cart_total": 5.980344479999999}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
	('968656f5-6d09-457f-8a41-bde01ad27a2f', '2026-01-12 08:00:48.834268+00', '9ca15d12-c764-48da-af8e-c38109175221', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-12T08:00:48.673Z", "cart_total": 627.66}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'),
	('5767a3d7-a3fb-43ee-bedd-0e029f0c1cb0', '2026-01-12 14:58:21.600443+00', 'c388454e-23a5-44ee-be9e-aa24bee87a5f', 'checkout_initiated', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{"url": "https://wishpeti.com/cart", "timestamp": "2026-01-12T14:58:21.592Z", "cart_total": 627.66}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36');


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transactions" ("id", "order_id", "creator_id", "amount_inr", "currency_code", "type", "status", "provider_payment_id", "created_at", "currency_rate") VALUES
	('723f57bc-fee0-4972-b1e2-da0e43646eca', 'e3950886-c7e2-4a4e-ba4b-ada96600f489', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', 627.66, 'INR', 'gift_payment', 'success', 'pay_S2tTJ58nW29li5', '2026-01-12 08:01:12.300366+00', 1),
	('9ea5f5df-3317-403c-96a4-291ea424533e', '688faf57-223a-492a-8e99-df8229035503', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', 627.66, 'INR', 'gift_payment', 'success', 'pay_S30aOWKNFmvSi5', '2026-01-12 14:58:44.948731+00', 1);


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('avatars', 'avatars', NULL, '2025-12-21 15:28:08.75234+00', '2025-12-21 15:28:08.75234+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('banners', 'banners', NULL, '2025-12-21 21:24:22.31276+00', '2025-12-21 21:24:22.31276+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('order-invoices', 'order-invoices', NULL, '2025-12-22 00:39:01.084875+00', '2025-12-22 00:39:01.084875+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('item-images', 'item-images', NULL, '2025-12-27 07:13:49.791392+00', '2025-12-27 07:13:49.791392+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('88f1bb1f-5e15-4851-864e-fde8a342d401', 'banners', 'neha_banner.png', NULL, '2026-01-12 07:06:05.986536+00', '2026-01-12 07:06:05.986536+00', '2026-01-12 07:06:05.986536+00', '{"eTag": "\"99b035baa2785cc2749a5343093ca46e-1\"", "size": 79946, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:06:06.000Z", "contentLength": 79946, "httpStatusCode": 200}', '39e101a8-cdc6-44da-9023-52e2cc4bdb55', NULL, NULL, 1),
	('925e1626-60ad-4d31-8667-87d8065d818a', 'banners', 'payal_banner.png', NULL, '2026-01-12 07:06:07.908135+00', '2026-01-12 07:06:07.908135+00', '2026-01-12 07:06:07.908135+00', '{"eTag": "\"f37ce7c408373edcb24bfeece5074d6b-1\"", "size": 285880, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:06:08.000Z", "contentLength": 285880, "httpStatusCode": 200}', '58ca6a2b-0e25-444c-ad75-67c0d94a452f', NULL, NULL, 1),
	('ac3bbcdd-0bce-4f49-a5cd-d46fd666b430', 'order-invoices', 'invoices/5672a53b-4411-4192-8cdb-5a8c7a0ffd15-1766364342156.jpg', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '2025-12-22 00:45:42.77262+00', '2025-12-22 00:45:42.77262+00', '2025-12-22 00:45:42.77262+00', '{"eTag": "\"00f553e05b9b3721dc4464a27a5388eb\"", "size": 1412689, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-22T00:45:43.000Z", "contentLength": 1412689, "httpStatusCode": 200}', 'f0f152b8-0ec2-496c-987d-b0b61b494c57', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '{}', 2),
	('8c23fb95-459a-4309-b71b-b3e496d73038', 'banners', 'samay_banner.png', NULL, '2026-01-12 07:06:10.390841+00', '2026-01-12 07:06:10.390841+00', '2026-01-12 07:06:10.390841+00', '{"eTag": "\"7bdb9c7d42bf1c410e4daea8eed4783e-1\"", "size": 502904, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:06:11.000Z", "contentLength": 502904, "httpStatusCode": 200}', 'd7187850-6d8f-4a7b-a306-bf76fd889100', NULL, NULL, 1),
	('259490e7-1a92-4686-bc57-a609e7aac812', 'banners', 'lakhshya_banner.png', NULL, '2026-01-12 07:06:10.807755+00', '2026-01-12 07:06:10.807755+00', '2026-01-12 07:06:10.807755+00', '{"eTag": "\"d95d396b6f759614dd85dc1341f2cbe9-1\"", "size": 570604, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:06:11.000Z", "contentLength": 570604, "httpStatusCode": 200}', '13f1bfda-b054-4909-9222-46faf740ed01', NULL, NULL, 1),
	('473aa75f-bdcb-42b8-87ac-401eb3df0dbb', 'banners', 'tanya_banner.png', NULL, '2026-01-12 07:06:10.689577+00', '2026-01-12 07:06:10.689577+00', '2026-01-12 07:06:10.689577+00', '{"eTag": "\"826558f08d3a4019b35b9baf48bf6d15-1\"", "size": 540494, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:06:11.000Z", "contentLength": 540494, "httpStatusCode": 200}', '3ba9104d-a742-457f-80ff-9110397d7726', NULL, NULL, 1),
	('c518c74f-639c-4bbc-a3f3-47abbd9a99a6', 'banners', '5ba592b5-ab1b-4faf-92bd-a8415b0e6684/banner_0.9667893671283755.jpg', NULL, '2026-01-12 07:07:06.29389+00', '2026-01-12 07:07:06.29389+00', '2026-01-12 07:07:06.29389+00', '{"eTag": "\"dc6f1faa70767e3092b2ce4d0c4bcb98-1\"", "size": 1412689, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:07:06.000Z", "contentLength": 1412689, "httpStatusCode": 200}', '91e69351-e260-4d5d-a73a-bcae620d7094', NULL, NULL, 2),
	('dce15a83-b663-44f2-ac2c-003d3c5ab28e', 'banners', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7/banner_0.22313644774012364.jpg', NULL, '2026-01-12 07:08:09.232763+00', '2026-01-12 07:08:09.232763+00', '2026-01-12 07:08:09.232763+00', '{"eTag": "\"dc6f1faa70767e3092b2ce4d0c4bcb98-1\"", "size": 1412689, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:08:09.000Z", "contentLength": 1412689, "httpStatusCode": 200}', '42989bec-d501-45fa-b45a-df97c0e1fec8', NULL, NULL, 2),
	('7932fd54-903e-4be6-94f8-7882a820ba6c', 'banners', '550b5fe8-45f0-496d-9640-6b6e7274ff74/banner_0.056163002505418835.jpg', NULL, '2026-01-12 07:20:47.371378+00', '2026-01-12 07:20:47.371378+00', '2026-01-12 07:20:47.371378+00', '{"eTag": "\"5f94c93a422cf30e3c8f2ca0d25585d0-1\"", "size": 1095125, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:20:48.000Z", "contentLength": 1095125, "httpStatusCode": 200}', '1a0e6add-a971-4e06-9eb6-e4abc5ec76d2', NULL, NULL, 2),
	('55c2b40f-adc2-4ba7-8ff8-be4bd136944a', 'banners', 'nancy_banner.png', NULL, '2026-01-12 07:06:10.701679+00', '2026-01-12 07:06:10.701679+00', '2026-01-12 07:06:10.701679+00', '{"eTag": "\"836cbf69b37bb8e90bc602894f1227a7-1\"", "size": 579005, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:06:11.000Z", "contentLength": 579005, "httpStatusCode": 200}', '4aa41ba9-671a-4f57-8bf8-08d6615a4251', NULL, NULL, 1),
	('9d70174b-9ac8-4fc1-91aa-a1bfd69126e1', 'banners', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363/banner_0.5131967876310914.jpg', NULL, '2026-01-12 07:07:31.690605+00', '2026-01-12 07:07:31.690605+00', '2026-01-12 07:07:31.690605+00', '{"eTag": "\"af697befc316e06b509646dd45c08e91-1\"", "size": 1275751, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:07:32.000Z", "contentLength": 1275751, "httpStatusCode": 200}', 'ff3051bb-ab53-487e-a577-ca5822c406bc', NULL, NULL, 2),
	('c3871912-3357-437f-a2bc-1477b72f0034', 'item-images', 'item-uploads/0.6458124888208816.jpg', NULL, '2026-01-12 06:55:35.089056+00', '2026-01-12 06:55:35.089056+00', '2026-01-12 06:55:35.089056+00', '{"eTag": "\"a297065f2b6fe5d0fe9a52ff30b9337d-1\"", "size": 587431, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T06:55:35.000Z", "contentLength": 587431, "httpStatusCode": 200}', 'c43f13ed-db42-475f-847e-7e8393ae0b0a', NULL, NULL, 2),
	('1c0b1fd6-c8a7-46a9-9eec-33936631741d', 'avatars', 'nancy.png', NULL, '2026-01-12 06:59:52.621061+00', '2026-01-12 06:59:52.621061+00', '2026-01-12 06:59:52.621061+00', '{"eTag": "\"2df592139e1f209eb83f30f09bcfd9ad-1\"", "size": 49554, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T06:59:53.000Z", "contentLength": 49554, "httpStatusCode": 200}', '2846746a-f5b5-4f4b-a0ba-9927f6973606', NULL, NULL, 1),
	('309c7c0f-a99a-49f5-9aac-5d2f7e22f732', 'avatars', 'payal.png', NULL, '2026-01-12 06:59:52.64659+00', '2026-01-12 06:59:52.64659+00', '2026-01-12 06:59:52.64659+00', '{"eTag": "\"a6f00278693ba013d2589aa37a0c92fa-1\"", "size": 51432, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T06:59:53.000Z", "contentLength": 51432, "httpStatusCode": 200}', 'ffa4d8de-3ed2-484d-bf30-241bd7afc315', NULL, NULL, 1),
	('5485b57e-c05f-4ecc-ae25-f76906fc5d88', 'avatars', 'neha.png', NULL, '2026-01-12 06:59:52.697272+00', '2026-01-12 06:59:52.697272+00', '2026-01-12 06:59:52.697272+00', '{"eTag": "\"eb412b1574909dd19416b8706438d456-1\"", "size": 48293, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T06:59:53.000Z", "contentLength": 48293, "httpStatusCode": 200}', 'bb1366c5-19a0-4347-82ac-e5b5560664e2', NULL, NULL, 1),
	('2efdd580-e20d-4724-abe9-39a75dd1a724', 'avatars', 'tanya.png', NULL, '2026-01-12 06:59:52.774273+00', '2026-01-12 06:59:52.774273+00', '2026-01-12 06:59:52.774273+00', '{"eTag": "\"3ab1457335542884594ffa3ec0b59b83-1\"", "size": 60918, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T06:59:53.000Z", "contentLength": 60918, "httpStatusCode": 200}', 'd9abdaea-d4b7-45de-ab42-c7270759fa21', NULL, NULL, 1),
	('ece1dc0e-2ddb-4589-8fb0-52841d97c8ca', 'avatars', 'lakhshya.png', NULL, '2026-01-12 06:59:52.77657+00', '2026-01-12 06:59:52.77657+00', '2026-01-12 06:59:52.77657+00', '{"eTag": "\"48ea52f2f7b66fba2d8350887dcc01ff-1\"", "size": 82025, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T06:59:53.000Z", "contentLength": 82025, "httpStatusCode": 200}', '28699f4d-2470-42fa-847e-1511d5a632bb', NULL, NULL, 1),
	('bafc84b2-fafd-4017-834a-b369167ccbf0', 'avatars', 'samay.png', NULL, '2026-01-12 06:59:52.851151+00', '2026-01-12 06:59:52.851151+00', '2026-01-12 06:59:52.851151+00', '{"eTag": "\"e60922112cc3d3d59719c8e77bc99556-1\"", "size": 67380, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T06:59:53.000Z", "contentLength": 67380, "httpStatusCode": 200}', '1f03b305-6a07-48fe-a447-56ffb33d6fc4', NULL, NULL, 1),
	('a5f90059-252d-41cf-97b8-75d63eb96c66', 'avatars', '1f86df76-580c-49da-b1ae-330024d6d652/avatar_0.4369668112209054.jpeg', NULL, '2026-01-12 07:01:02.661256+00', '2026-01-12 07:01:02.661256+00', '2026-01-12 07:01:02.661256+00', '{"eTag": "\"c2944975cd587c0895b9c7e1d7f36610-1\"", "size": 2144021, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:01:02.000Z", "contentLength": 2144021, "httpStatusCode": 200}', '4a3e75f0-0aa1-4582-b29c-cd215d0af928', NULL, NULL, 2),
	('d9a5d730-ff4e-4f76-8305-fbdadafc5859', 'avatars', '550b5fe8-45f0-496d-9640-6b6e7274ff74/avatar_0.5810347457757881.webp', NULL, '2026-01-12 07:02:12.859824+00', '2026-01-12 07:02:12.859824+00', '2026-01-12 07:02:12.859824+00', '{"eTag": "\"3f636ad142ea0753a372957f71b62bf1-1\"", "size": 44576, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:02:13.000Z", "contentLength": 44576, "httpStatusCode": 200}', '0864ef3f-8a67-4bf3-97ea-e9bcbea7240a', NULL, NULL, 2),
	('3df422b1-ed6a-4f5e-b015-330823dd8de1', 'avatars', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363/avatar_0.8518174641117244.jpeg', NULL, '2026-01-12 07:02:51.543063+00', '2026-01-12 07:02:51.543063+00', '2026-01-12 07:02:51.543063+00', '{"eTag": "\"d4ac7b79602e61ac6cd92a171c759f52-1\"", "size": 118080, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:02:52.000Z", "contentLength": 118080, "httpStatusCode": 200}', 'df54e742-51d2-4716-99a7-31f2ad593b59', NULL, NULL, 2),
	('e99c2d9e-26f3-484c-9f5a-91629b17e53d', 'avatars', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7/avatar_0.15625283262996414.jpeg', NULL, '2026-01-12 07:03:17.950567+00', '2026-01-12 07:03:17.950567+00', '2026-01-12 07:03:17.950567+00', '{"eTag": "\"ee420781b4f02cd7d927b9531685b512-1\"", "size": 38877, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-12T07:03:18.000Z", "contentLength": 38877, "httpStatusCode": 200}', 'ae9666a8-c38f-449b-b438-f64639ae4339', NULL, NULL, 2);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('order-invoices', 'invoices', '2025-12-22 00:45:42.77262+00', '2025-12-22 00:45:42.77262+00'),
	('item-images', 'item-uploads', '2026-01-12 06:55:22.074463+00', '2026-01-12 06:55:22.074463+00'),
	('avatars', '1f86df76-580c-49da-b1ae-330024d6d652', '2026-01-12 07:00:42.478825+00', '2026-01-12 07:00:42.478825+00'),
	('avatars', '550b5fe8-45f0-496d-9640-6b6e7274ff74', '2026-01-12 07:02:06.878849+00', '2026-01-12 07:02:06.878849+00'),
	('avatars', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '2026-01-12 07:02:43.443826+00', '2026-01-12 07:02:43.443826+00'),
	('avatars', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '2026-01-12 07:03:10.790791+00', '2026-01-12 07:03:10.790791+00'),
	('banners', '5ba592b5-ab1b-4faf-92bd-a8415b0e6684', '2026-01-12 07:06:54.969284+00', '2026-01-12 07:06:54.969284+00'),
	('banners', 'e146ff2f-1269-4b2e-9efc-5c51c57f2363', '2026-01-12 07:07:07.017885+00', '2026-01-12 07:07:07.017885+00'),
	('banners', 'ed08926e-1fb3-452f-a8dd-c9790e7187b7', '2026-01-12 07:07:40.208698+00', '2026-01-12 07:07:40.208698+00'),
	('banners', '550b5fe8-45f0-496d-9640-6b6e7274ff74', '2026-01-12 07:20:40.829695+00', '2026-01-12 07:20:40.829695+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

INSERT INTO "supabase_functions"."hooks" ("id", "hook_table_id", "hook_name", "created_at", "request_id") VALUES
	(1, 17557, 'send_order_notifications', '2026-01-11 20:40:26.882691+00', 251),
	(2, 17557, 'send_order_notifications', '2026-01-11 20:43:53.015557+00', 252),
	(3, 17557, 'send_order_notifications', '2026-01-11 20:47:28.709433+00', 253),
	(4, 17557, 'send_order_notifications', '2026-01-11 20:53:16.347262+00', 254),
	(5, 17557, 'send_order_notifications', '2026-01-11 20:55:03.603553+00', 255),
	(6, 17557, 'send_order_notifications', '2026-01-11 20:55:06.069295+00', 256),
	(7, 17557, 'send_order_notifications', '2026-01-11 20:55:09.011706+00', 257),
	(8, 17557, 'send_order_notifications', '2026-01-11 20:55:11.629555+00', 258),
	(9, 17557, 'send_order_notifications', '2026-01-11 20:55:14.654402+00', 259),
	(10, 17557, 'send_order_notifications', '2026-01-11 20:59:57.056783+00', 260),
	(11, 17557, 'send_order_notifications', '2026-01-11 21:02:37.543581+00', 262),
	(12, 17557, 'send_order_notifications', '2026-01-11 21:04:32.038754+00', 263),
	(13, 17557, 'send_order_notifications', '2026-01-11 21:10:48.191458+00', 264),
	(14, 17557, 'send_order_notifications', '2026-01-11 21:11:16.566859+00', 265),
	(15, 17557, 'send_order_notifications', '2026-01-11 21:13:24.275743+00', 266),
	(16, 17557, 'send_order_notifications', '2026-01-11 21:13:59.644412+00', 267),
	(17, 17557, 'send_order_notifications', '2026-01-11 21:20:32.829158+00', 268),
	(18, 17557, 'send_order_notifications', '2026-01-11 21:20:32.829158+00', 269),
	(19, 17557, 'send_order_notifications', '2026-01-11 21:20:46.234076+00', 270),
	(20, 17557, 'send_order_notifications', '2026-01-11 21:20:46.234076+00', 271),
	(21, 17557, 'send_order_notifications', '2026-01-11 21:20:51.917073+00', 272),
	(22, 17557, 'send_order_notifications', '2026-01-11 21:20:51.917073+00', 273),
	(23, 17557, 'send_order_notifications', '2026-01-11 21:20:58.156572+00', 274),
	(24, 17557, 'send_order_notifications', '2026-01-11 21:20:58.156572+00', 275),
	(25, 17557, 'send_order_notifications', '2026-01-11 21:21:04.094684+00', 276),
	(26, 17557, 'send_order_notifications', '2026-01-11 21:21:04.094684+00', 277),
	(27, 17557, 'send_order_notifications', '2026-01-11 21:21:09.073378+00', 278),
	(28, 17557, 'send_order_notifications', '2026-01-11 21:21:09.073378+00', 279),
	(29, 17557, 'send_order_notifications', '2026-01-11 21:21:13.521867+00', 280),
	(30, 17557, 'send_order_notifications', '2026-01-11 21:21:13.521867+00', 281),
	(31, 17557, 'send_order_notifications', '2026-01-11 21:21:18.551505+00', 282),
	(32, 17557, 'send_order_notifications', '2026-01-11 21:21:18.551505+00', 283),
	(33, 17557, 'send_order_notifications', '2026-01-11 21:21:23.433863+00', 284),
	(34, 17557, 'send_order_notifications', '2026-01-11 21:21:23.433863+00', 285),
	(35, 17557, 'send_order_notifications', '2026-01-11 21:28:54.04979+00', 286),
	(36, 17557, 'send_order_notifications', '2026-01-11 21:30:08.838545+00', 287),
	(37, 17557, 'send_order_notifications', '2026-01-11 21:32:25.445028+00', 288),
	(38, 17557, 'send_order_notifications', '2026-01-11 21:32:25.445028+00', 289),
	(39, 17557, 'send_order_notifications', '2026-01-11 21:36:20.204301+00', 290),
	(40, 17557, 'send_order_notifications', '2026-01-11 21:37:16.535739+00', 291),
	(41, 17557, 'send_order_notifications', '2026-01-11 21:38:09.895906+00', 292),
	(42, 17557, 'send_order_notifications', '2026-01-11 21:38:09.895906+00', 293),
	(43, 17557, 'send_order_notifications', '2026-01-11 21:40:56.222935+00', 294),
	(44, 17557, 'send_order_notifications', '2026-01-11 21:41:35.528346+00', 295),
	(45, 17557, 'send_order_notifications', '2026-01-11 21:44:19.111613+00', 296),
	(46, 17557, 'send_order_notifications', '2026-01-11 21:45:03.2173+00', 297),
	(47, 17557, 'send_order_notifications', '2026-01-11 21:45:03.2173+00', 298),
	(48, 17557, 'send_order_notifications', '2026-01-11 21:49:00.009359+00', 299),
	(49, 17557, 'send_order_notifications', '2026-01-11 21:49:23.531639+00', 300),
	(50, 17557, 'send_order_notifications', '2026-01-11 21:49:23.531639+00', 301),
	(51, 17596, 'notifications', '2026-01-12 07:21:40.877775+00', 1),
	(52, 17596, 'notifications', '2026-01-12 07:22:23.01825+00', 2),
	(53, 17596, 'notifications', '2026-01-12 07:22:23.01825+00', 3),
	(54, 17596, 'notifications', '2026-01-12 08:01:11.89034+00', 4),
	(55, 17596, 'notifications', '2026-01-12 14:58:44.75955+00', 5);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 615, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 55, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict Nuf1GakZdTfSlQsBdTMZwavVx3ULjthHQAAh4nv1po76PNftxZjTFgPc4xQs5mM

RESET ALL;
