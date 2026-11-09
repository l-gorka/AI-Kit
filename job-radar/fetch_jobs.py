#!/usr/bin/env python3
"""Fetch marketing job offers from several boards and build dashboard.html.

Usage:  python3 fetch_jobs.py            # fetch all sources, rebuild dashboard.html
        python3 fetch_jobs.py --only nofluffjobs,remotive
Stdlib only. A source that fails is reported and skipped; it never breaks the run.
"""
import argparse, json, re, sys, urllib.request, urllib.parse, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).parent
CONFIG = json.loads((HERE / "config.json").read_text(encoding="utf-8"))
UA = {"User-Agent": "Mozilla/5.0 (job-radar personal aggregator)"}
RATES = CONFIG["fx_to_pln"]
MKT = re.compile("|".join(CONFIG["marketing_terms"]), re.I)


def get(url, timeout=60):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def get_json(url):
    return json.loads(get(url))


def iso_from_ms(ms):
    return datetime.fromtimestamp(ms / 1000, timezone.utc).isoformat()


def to_pln_month(value, currency, period="month"):
    if value is None:
        return None
    v = float(value) * RATES.get((currency or "PLN").upper(), 0)
    if v == 0:
        return None
    return round(v * {"month": 1, "year": 1 / 12, "hour": 168, "day": 21}.get(period, 1))


def job(**kw):
    base = dict(id="", source="", title="", company="", url="", city="", country="",
                remote=False, hybrid=False, salary_min=None, salary_max=None, salary_note="",
                seniority="", tags=[], posted="", summary="")
    base.update(kw)
    base["id"] = f'{base["source"]}:{base["id"]}'
    return base


# ---- sources -------------------------------------------------------------

def nofluffjobs():
    """Polish board. Tested. Categories marketing + sales come from one big (~120MB) call."""
    d = get_json("https://nofluffjobs.com/api/posting?salaryCurrency=PLN&salaryPeriod=month&region=pl")
    out = []
    for p in d["postings"]:
        if p.get("category") not in ("marketing", "sales"):
            continue
        places = p["location"]["places"]
        cities = [x["city"] for x in places if x.get("city") and x["city"] != "Remote"]
        codes = {(x.get("country") or {}).get("code") for x in places} - {None}
        in_pl = (not codes) or "POL" in codes or "pl" in codes  # remote/province-only entries carry no country
        s = p.get("salary") or {}
        tags = [t["value"] for t in p.get("tiles", {}).get("values", []) if t["type"] == "requirement"]
        loc_type = p["location"].get("type", "")
        out.append(job(
            id=p["id"], source="NoFluffJobs", title=p["title"], company=p["name"],
            url="https://nofluffjobs.com/pl/job/" + p["url"],
            city=cities[0] if cities else "", country="PL" if in_pl else sorted(codes)[0],
            remote=bool(p["location"].get("fullyRemote")) or loc_type == "remote",
            hybrid=loc_type == "hybrid",
            salary_min=to_pln_month(s.get("from"), s.get("currency")),
            salary_max=to_pln_month(s.get("to"), s.get("currency")),
            salary_note=(s.get("type") or ""),
            seniority=", ".join(p.get("seniority") or []), tags=tags,
            posted=iso_from_ms(p["posted"])))
    return out


def arbeitnow():
    """Germany/EU board with a remote flag. Untested from the build sandbox."""
    out = []
    for page in (1, 2, 3):
        d = get_json(f"https://www.arbeitnow.com/api/job-board-api?page={page}")
        for p in d.get("data", []):
            text = p["title"] + " " + " ".join(p.get("tags", []))
            if not MKT.search(text):
                continue
            out.append(job(id=p["slug"], source="Arbeitnow", title=p["title"], company=p["company_name"],
                           url=p["url"], city=p.get("location", ""), remote=bool(p.get("remote")),
                           tags=p.get("tags", []), posted=iso_from_ms(p["created_at"] * 1000)))
    return out


def remotive():
    """Remote jobs worldwide. Untested from the build sandbox."""
    d = get_json("https://remotive.com/api/remote-jobs?category=marketing")
    return [job(id=p["id"], source="Remotive", title=p["title"], company=p["company_name"], url=p["url"],
                city=p.get("candidate_required_location", ""), remote=True, tags=p.get("tags", []),
                salary_note=p.get("salary", ""), posted=p.get("publication_date", ""))
            for p in d.get("jobs", [])]


def remoteok():
    """Remote jobs worldwide. Untested from the build sandbox."""
    d = get_json("https://remoteok.com/api")[1:]
    out = []
    for p in d:
        if not MKT.search(p.get("position", "") + " " + " ".join(p.get("tags", []))):
            continue
        out.append(job(id=p["id"], source="RemoteOK", title=p["position"], company=p["company"], url=p["url"],
                       city=p.get("location", ""), remote=True, tags=p.get("tags", []),
                       salary_min=to_pln_month(p.get("salary_min") or None, "USD", "year"),
                       salary_max=to_pln_month(p.get("salary_max") or None, "USD", "year"),
                       posted=p.get("date", "")))
    return out


def weworkremotely():
    """RSS feed. Untested from the build sandbox."""
    root = ET.fromstring(get("https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss"))
    out = []
    for it in root.iter("item"):
        t = it.findtext("title", "")
        company, _, title = t.partition(": ")
        out.append(job(id=it.findtext("guid", ""), source="WeWorkRemotely", title=title or t, company=company,
                       url=it.findtext("link", ""), remote=True, city=it.findtext("region", ""),
                       posted=datetime.strptime(it.findtext("pubDate"), "%a, %d %b %Y %H:%M:%S %z").isoformat()
                       if it.findtext("pubDate") else ""))
    return out


SOURCES = dict(nofluffjobs=nofluffjobs, arbeitnow=arbeitnow, remotive=remotive,
               remoteok=remoteok, weworkremotely=weworkremotely)


# ---- build ---------------------------------------------------------------

def dedupe(jobs):
    seen, out = {}, []
    for j in jobs:
        k = (j["company"].lower().strip(), re.sub(r"\W+", " ", j["title"].lower()).strip())
        if k in seen:
            continue
        seen[k] = 1
        out.append(j)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="comma-separated source names")
    names = (ap.parse_args().only or ",".join(SOURCES)).split(",")
    jobs, report = [], {}
    for n in names:
        try:
            r = SOURCES[n]()
            jobs += r
            report[n] = f"ok, {len(r)} jobs"
        except Exception as e:  # keep going, one dead source must not kill the run
            report[n] = f"FAILED: {type(e).__name__}: {e}"
    jobs = dedupe(jobs)
    data = dict(generated=datetime.now(timezone.utc).isoformat(), sources=report,
                config=CONFIG["default_criteria"], search_links=CONFIG["search_links"], jobs=jobs)
    (HERE / "jobs.json").write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    html = (HERE / "template.html").read_text(encoding="utf-8")
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    (HERE / "dashboard.html").write_text(html.replace("/*__DATA__*/null", blob), encoding="utf-8")
    for n, r in report.items():
        print(f"{n:15} {r}")
    print(f"{len(jobs)} unique jobs -> {HERE/'dashboard.html'}")


if __name__ == "__main__":
    main()
