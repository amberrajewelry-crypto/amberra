#!/usr/bin/env python3
"""Submit Amberra URLs to Google Indexing API. Usage: google-indexing.py [--all|--url URL]
Needs service-account.json (gitignored) added as Owner in GSC для https://www.amberrajewelry.com/"""
import sys, xml.etree.ElementTree as ET
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build

ROOT = Path(__file__).parent.parent
SA = ROOT / "service-account.json"
SITEMAP = ROOT / "sitemap.xml"
SCOPES = ["https://www.googleapis.com/auth/indexing"]

def service():
    creds = service_account.Credentials.from_service_account_file(str(SA), scopes=SCOPES)
    return build("indexing", "v3", credentials=creds)

def submit(svc, url):
    try:
        svc.urlNotifications().publish(body={"url": url, "type": "URL_UPDATED"}).execute()
        print(f"  OK   {url}"); return True
    except Exception as e:
        print(f"  FAIL {url} — {str(e)[:120]}"); return False

def urls():
    ns = {"n": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return sorted({l.text for l in ET.parse(SITEMAP).findall(".//n:loc", ns)})

if __name__ == "__main__":
    svc = service()
    if len(sys.argv) > 2 and sys.argv[1] == "--url":
        submit(svc, sys.argv[2])
    else:
        us = urls(); print(f"Submitting {len(us)} URLs…")
        ok = sum(submit(svc, u) for u in us)
        print(f"\nDone: {ok}/{len(us)} OK")
