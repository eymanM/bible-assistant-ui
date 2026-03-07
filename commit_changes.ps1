git add src/app/about/AboutClient.tsx src/app/contact/ContactClient.tsx
git commit -m "style(ui): improve responsive design for about and contact pages"

git add src/components/SearchBar.tsx
git commit -m "fix(search): change input type from search to text to avoid default styling"

git add src/hooks/useBibleSearch.ts
git commit -m "perf(search): add request cancellation and startTransition for better responsiveness"

git add src/app/admin/ src/app/api/admin/ src/components/Sidebar.tsx
git commit -m "feat(admin): add admin dashboard with metrics and flagged searches"

git add src/app/search/
git commit -m "feat(search): implement public search details page for sharing"
