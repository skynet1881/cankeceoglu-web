# cankeceoglu-web
Website for my personal courses test

Contact form: the About page opens an email draft addressed to skynettech1992@gmail.com in the visitor's email app. Visitors send the draft themselves; direct website delivery requires an email backend or form service.

## Cloudflare backend and statistics

This project now includes a Cloudflare Worker (`worker.mjs`) serving the static files and two APIs. The configuration targets the existing `cankeceoglu-web` Worker; verify its name matches your Cloudflare project before deploying. No frontend build is required. Static-only uploads will not deploy the API.

- `GET /api/learners`: reads the exact instructor-specific student and course counts from the Udemy profile. Successful responses are cached for one hour per Cloudflare location. Updates happen on visits, not on a schedule. Udemy may block automated requests or change its HTML; failures preserve the browser's displayed snapshot and verification date. Both totals start from the verified October 4, 2026 snapshot (8,685 students and 14 courses). A visible status distinguishes a successful refresh from fallback data.
- `POST /api/visits`: records one page view per document load, including reloads. It stores only daily totals by page and country in D1. No IP addresses, cookies, or visitor identifiers are stored. Counts begin after setup; they are not historical traffic or unique people. Bots and repeated requests can increase counts, and blocked JavaScript can undercount traffic.
- `GET /api/visits`: returns the public total without adding a view. Missing database configuration displays an em dash on the site.

Use Node.js 22 or newer for Wrangler and tests.

1. Authenticate: `npx wrangler login`.
2. Create the database: `npx wrangler d1 create cankeceoglu-stats`.
3. Add the returned database ID to `wrangler.jsonc` as a top-level binding:

   ```json
   "d1_databases": [{
     "binding": "DB",
     "database_name": "cankeceoglu-stats",
     "database_id": "YOUR_DATABASE_ID"
   }]
   ```

4. Initialize production storage: `npx wrangler d1 migrations apply cankeceoglu-stats --remote`.
5. Deploy: `npx wrangler deploy`. For Workers Git integration, set the deploy command to `npx wrangler deploy` and remove any assets-only deploy command.
6. Check `/api/learners` and `/api/visits` on the deployed domain, then load both pages.

For local development, apply the migrations with `--local` and run `npx wrangler dev`. Run tests with `node --test tests/stats.test.mjs`.

For visitor/device/referrer reports, enable [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/get-started/) for your domain and add the provided beacon snippet to both HTML pages. For a Pages project, Cloudflare can inject it automatically when Web Analytics is enabled. A Worker deployment needs the site's actual beacon token; none is invented or committed here. View analytics privately in the Cloudflare dashboard. Daily page/country totals can also be queried in the D1 console:

```sql
SELECT day, path, country, SUM(views) AS views
FROM page_views
GROUP BY day, path, country
ORDER BY day DESC, views DESC;
```

The contact form still opens an email draft. Deploying this statistics backend does not enable direct email delivery.

## Udemy refresh when Worker requests fail

The learner API uses `public/udemy-stats.json` if direct Udemy access fails. It returns `upstreamAvailable: false` and a diagnostic `reason` (for example, `udemy_http_403` or `profile_parse_failed`) and retains the snapshot's actual verification timestamp. Cache errors no longer discard a successful fetch.

The **Update Udemy statistics** GitHub Actions workflow checks the profile every six hours and commits a verified snapshot to `main`. After pushing the workflow, run it once from GitHub → Actions → Update Udemy statistics → Run workflow. Repository Actions must be enabled and the workflow must have permission to write contents; branch protection may prevent its push. Failed fetches leave the previous snapshot untouched. Udemy can also block GitHub runners; check the run log rather than assuming the data refreshed.

If Cloudflare does not deploy commits made by the Actions bot, redeploy the latest commit manually. This workflow updates the repository, not the running Worker directly. For a manual snapshot update, run `node scripts/update-udemy-stats.mjs`, then commit, push, and deploy. Do not change the verification date without successfully fetching the source.
