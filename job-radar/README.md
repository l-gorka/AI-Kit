# Marketing Job Radar

Personal job aggregator for marketing roles (Poland first, remote/EU second).
Fetches offers, then opens a self-contained `dashboard.html` where you edit the
ranking criteria live (keywords + weights, min salary, cities, seniority,
freshness) and track Save / Applied / Hide. Criteria and statuses are kept in
the browser's localStorage.

```bash
python3 job-radar/fetch_jobs.py          # needs Python 3.9+, no dependencies
open job-radar/dashboard.html            # or just double-click it
python3 job-radar/fetch_jobs.py --only nofluffjobs
```

Sources: NoFluffJobs (verified), Arbeitnow, Remotive, RemoteOK, WeWorkRemotely
(written against their public APIs but not yet verified, so check the "Sources"
panel after a run). A failing source is skipped.

Pracuj.pl, LinkedIn, Indeed, OLX etc. have no public API and block scraping, so
the dashboard gives one-click search links for them instead. Defaults live in
`config.json`; add a source by writing a function in `fetch_jobs.py` that
returns `job(...)` dicts and registering it in `SOURCES`.
