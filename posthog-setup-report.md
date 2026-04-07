# PostHog post-wizard report

The wizard has completed a deep integration of the portfolio site with PostHog analytics. A new `src/posthog.ts` helper was created to initialize the `posthog-node` client using environment variables and generate a stable anonymous distinct ID per browser session via `localStorage`. Event tracking calls were added to four component files covering all meaningful user interactions: tab navigation, hero CTA clicks, blog post and research paper engagement, and PDF downloads.

| Event | Description | File |
|---|---|---|
| `tab navigated` | User switches between main navigation tabs (Home, Research, Blog, Resume) | `src/App.tsx` |
| `research cta clicked` | User clicks "View Research →" CTA button on the Home tab hero | `src/App.tsx` |
| `resume cta clicked` | User clicks "Résumé" CTA button on the Home tab hero | `src/App.tsx` |
| `blog post opened` | User opens a blog post to read the full content | `src/Blog.tsx` |
| `blog post closed` | User closes a blog post and returns to the blog listing | `src/Blog.tsx` |
| `paper opened` | User opens a research paper to read the full content | `src/Papers.tsx` |
| `paper closed` | User closes a research paper and returns to the research listing | `src/Papers.tsx` |
| `paper pdf downloaded` | User clicks the Download PDF button on a research paper | `src/Papers.tsx` |
| `resume pdf downloaded` | User clicks the Download PDF button on the Resume page | `src/Resume.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/371794/dashboard/1437300
- **Tab navigation by tab** (trends, breakdown by tab): https://us.posthog.com/project/371794/insights/umU0uvSG
- **Research CTA → Paper opened → PDF downloaded funnel**: https://us.posthog.com/project/371794/insights/wT7iba5i
- **PDF downloads (paper & resume)** (trends): https://us.posthog.com/project/371794/insights/cw3aQoVT
- **Daily unique blog readers** (trends): https://us.posthog.com/project/371794/insights/WVT13B8g
- **Navigation to blog content funnel**: https://us.posthog.com/project/371794/insights/lf5x6D8d

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
