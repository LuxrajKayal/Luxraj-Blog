# Luxy — Phase 1: Website Crawling and Content Eligibility Plan

**Project:** Luxy v3.6 — Luxraj Blog Integration  
**Phase:** 1 — Crawling Scope and Eligibility Policy  
**Status:** Approved policy

## 1. Core Principle

Luxy must understand and present only information that Luxraj Blog intentionally publishes for its public visitors.

Technical accessibility does not automatically make content eligible for crawling or indexing.

The website's publication intent determines eligibility.

Luxy must never treat the GitHub repository, project files, internal documentation or development environment as its knowledge source.

## 2. Eligible Public-Facing Content

Luxy may crawl and index the following types of publicly published information:

- Published blog articles.
- About, Contact and other public informational pages.
- Privacy Policy and Terms and Conditions.
- Newsletter information and subscription instructions.
- Editorial, contribution and submission policies.
- Copyright, licensing and public brand information.
- Public FAQs and help pages.
- Public author profiles.
- Other pages intentionally published for website visitors.

The scope includes the entire public-facing website, not merely its blog articles.

## 3. Discovery-Only Resources

The crawler may visit certain resources to discover eligible public pages without indexing their repetitive content as independent knowledge.

Examples:

- Category archives.
- Tag archives.
- Paginated article listings.
- Public navigation and index pages.
- XML sitemaps.
- RSS and Atom feeds.

These resources support page discovery. Their existence does not automatically make their contents searchable knowledge.

## 4. Strictly Excluded Content

The following material is not eligible for crawling or indexing:

### 4.1 Internal Implementation

- HTML, JavaScript and CSS implementation files as source-code documents.
- Luxy crawler, tokenizer, ranking and search-engine source code.
- Internal application libraries.
- Build scripts and deployment configurations.
- Internal JSON data and development fixtures.
- Repository and development-environment files.

### 4.2 Owner-Only Documentation

Documentation written for the website owner or developer, rather than public visitors, must never be crawled.

Examples include:

- Personal reference documents.
- Internal architecture and engineering notes.
- Development guides and implementation instructions.
- Private project documentation.
- Technical research notes.
- Repository-maintenance instructions.
- Internal planning documents.
- Documents stored in `Luxy-reference/` or other owner-only documentation folders.

**Important:** Owner-only documentation remains excluded even if it is technically accessible through a public repository or an exposed URL. Repository visibility is not permission to index its contents.

### 4.3 Unpublished and Restricted Material

- Draft and unpublished articles.
- Private or restricted content.
- Administrative dashboards.
- Internal settings pages.
- Temporary test articles and development samples.
- Error pages and irrelevant duplicate versions.
- External websites outside the approved Luxraj Blog content boundary.

## 5. Content Intent Versus File Type

Eligibility is determined by publication purpose, not merely by file extension.

For example:

- A JavaScript example intentionally included in a public educational article is eligible as article content.
- The JavaScript file implementing Luxraj's website interface is internal implementation and is excluded.
- A public technical guide is eligible.
- An internal technical document written for the owner is excluded.

Luxy should index the reader-facing information extracted from public pages, not indiscriminately ingest their implementation source.

## 6. Reader Questions About Excluded Material

Luxy must not invent answers or imply that it has inspected excluded internal material.

When asked about internal source code, owner-only documentation or private project files, it should explain that these are outside its public searchable knowledge.

Example:

**Reader:** "Show me Luxraj's internal JavaScript source code."

**Luxy:** "I can explain publicly documented website features, but internal implementation source code is outside my searchable content."

Luxy must not expose internal material through search results, autocomplete, source links or generated responses.

## 7. Content Eligibility Rules

The following rules govern crawling and indexing:

1. Only the approved Luxraj Blog website domain is within scope.
2. Only intentionally public-facing content is eligible for indexing.
3. Owner-only and internal documentation is always excluded.
4. Draft, unpublished and restricted material is excluded.
5. `noindex` directives must be respected.
6. Canonical URLs should be used to avoid duplicate indexing.
7. Search-result pages and unnecessary tracking parameters should not become independent knowledge.
8. Original public page URLs and section identifiers should be preserved for source navigation.
9. Discovery-only resources must not be confused with index-eligible content.

## 8. Acceptance Principle

The integration will be considered compliant with Phase 1 only when Luxy's knowledge is restricted to the intended public-facing information of Luxraj Blog.

The presence of a file in the repository, a reachable URL or a technically readable document is never sufficient authorization for indexing.

**Governing rule: Luxy serves the public website's intended knowledge, not the website owner's internal workspace.**

## 9. Phase Boundary

This document establishes the approved crawling and content-eligibility policy.

It does not authorize changes to the crawler, search engine, BM25+ ranking, tokenization, indexing implementation or website files.

Those matters belong to the subsequent research, decision, implementation and verification phases.
