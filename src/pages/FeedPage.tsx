import { Box, Button, Drawer, Heading, Stack, Text } from "@chakra-ui/react";
import { SOURCE_CATALOG, SOURCE_IDS } from "@shared/sources.ts";
import type { Article, ArticlePage, ArticleQuery } from "@shared/article.ts";
import { defaultPreferences, type Preferences } from "@shared/preferences.ts";
import { mergePageQuery, paramsFromEffective } from "@shared/query.ts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchArticles, fetchSources, type SourceCatalogItem } from "../api/client.ts";
import { ResultCount } from "../components/molecules/ResultCount.tsx";
import { ActiveFilters } from "../components/organisms/ActiveFilters.tsx";
import { ArticleList } from "../components/organisms/ArticleList.tsx";
import { EmptyFeed } from "../components/organisms/EmptyFeed.tsx";
import { FeedSkeleton } from "../components/organisms/FeedSkeleton.tsx";
import { FeedToolbar } from "../components/organisms/FeedToolbar.tsx";
import { FilterPanel } from "../components/organisms/FilterPanel.tsx";
import { PreferencesForm } from "../components/organisms/PreferencesForm.tsx";
import { SourceHealth } from "../components/organisms/SourceHealth.tsx";
import { AppShell } from "../components/templates/AppShell.tsx";
import { usePreferences } from "../hooks/usePreferences.ts";

type FeedStatus = "loading" | "ready" | "empty" | "partial" | "failed" | "loadingMore";

const PAGE_SIZE = 10;

export function FeedPage() {
  const { preferences, save, reset } = usePreferences();
  const [params, setParams] = useSearchParams();
  const paramKey = params.toString();
  const parsed = useMemo(
    () => mergePageQuery(preferences, new URLSearchParams(paramKey)),
    [preferences, paramKey],
  );
  const query = parsed.ok ? parsed.query : null;
  const [keyword, setKeyword] = useState(query?.q ?? "");
  const [catalog, setCatalog] = useState<SourceCatalogItem[]>(SOURCE_CATALOG);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pageInfo, setPageInfo] = useState<ArticlePage | null>(null);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [draft, setDraft] = useState<Preferences>(defaultPreferences);
  const articlesRef = useRef<Article[]>([]);

  const commit = useCallback(
    (next: ArticleQuery) => {
      setParams(paramsFromEffective(next, preferences), { replace: true });
    },
    [preferences, setParams],
  );

  useEffect(() => {
    setKeyword(query?.q ?? "");
  }, [query?.q]);

  useEffect(() => {
    if (!query) return;
    if (keyword === (query.q ?? "")) return;
    const handle = window.setTimeout(() => {
      commit({ ...query, q: keyword.trim() || undefined, page: 1 });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [keyword, query, commit]);

  useEffect(() => {
    document.title = query?.q ? `Folio · ${query.q}` : "Folio";
  }, [query?.q]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSources(controller.signal)
      .then(setCatalog)
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const queryKey = query ? JSON.stringify(query) : `invalid:${parsed.ok ? "" : parsed.error}`;

  useEffect(() => {
    if (!query) {
      setStatus("failed");
      setError(parsed.ok ? null : parsed.error);
      return;
    }
    const controller = new AbortController();
    const targetPage = query.page;
    const more = targetPage > 1 && articlesRef.current.length > 0;
    setStatus(more ? "loadingMore" : "loading");
    setError(null);
    const run = async () => {
      try {
        if (more) {
          const result = await fetchArticles({ ...query, page: targetPage }, controller.signal);
          const merged = mergeUnique(articlesRef.current, result.articles);
          articlesRef.current = merged;
          setArticles(merged);
          setPageInfo(result);
          setStatus(classify(result, merged.length));
          return;
        }
        const collected: Article[] = [];
        let last: ArticlePage | null = null;
        for (let page = 1; page <= targetPage; page += 1) {
          last = await fetchArticles({ ...query, page }, controller.signal);
          for (const article of last.articles) {
            if (!collected.some((item) => item.id === article.id)) collected.push(article);
          }
        }
        if (!last) return;
        articlesRef.current = collected;
        setArticles(collected);
        setPageInfo(last);
        setStatus(classify(last, collected.length));
      } catch (caught) {
        if (controller.signal.aborted) return;
        const message = caught instanceof Error ? caught.message : "The feed did not load";
        if (more) {
          setError(message);
          setStatus(articlesRef.current.length > 0 ? "partial" : "failed");
          return;
        }
        setArticles([]);
        articlesRef.current = [];
        setError(message);
        setStatus("failed");
      }
    };
    void run();
    return () => controller.abort();
  }, [queryKey, reloadToken, query, parsed]);

  function clearFilters() {
    commit({ sources: [...SOURCE_IDS], categories: [], authors: [], page: 1 });
    setKeyword("");
  }

  function openPreferences() {
    if (query) {
      setDraft({ sources: [...query.sources], categories: [...query.categories], authors: [...query.authors] });
    }
    setPrefsOpen(true);
  }

  const canLoadMore = Boolean(
    pageInfo && (status === "ready" || status === "partial" || status === "loadingMore") && pageInfo.sources.some((source) => source.status === "ok" && source.count === PAGE_SIZE),
  );
  const showFixture = pageInfo?.mode === "fixture" && status !== "loading" && status !== "failed";
  const showHealth = pageInfo && status !== "failed" && status !== "loading";

  const fallbackQuery: ArticleQuery = query ?? {
    sources: preferences.sources,
    categories: preferences.categories,
    authors: preferences.authors,
    page: 1,
  };

  return (
    <>
      <AppShell
        toolbar={
          <FeedToolbar
            keyword={keyword}
            onKeywordChange={setKeyword}
            onSearchSubmit={() => query && commit({ ...query, q: keyword.trim() || undefined, page: 1 })}
            onOpenFilters={() => setFiltersOpen(true)}
            onOpenPreferences={openPreferences}
          />
        }
        sidebar={query ? <FilterPanel query={query} sources={catalog} onChange={commit} /> : null}
        banner={
          <>
            {showFixture ? (
              <Box role="status" borderWidth="1px" borderColor="line" px="4" py="3">
                Showing sample articles. Live headlines load when this server has the news API keys.
              </Box>
            ) : null}
            {showHealth && pageInfo ? <SourceHealth sources={pageInfo.sources} /> : null}
          </>
        }
        main={
          <Stack gap="4">
            {query ? <ActiveFilters query={query} onChange={commit} /> : null}
            {status === "loading" ? <FeedSkeleton /> : null}
            {status === "failed" ? (
              <Stack gap="3" py="8">
                <Heading as="h2" size="lg" fontFamily="heading">
                  The feed did not load
                </Heading>
                <Text>{error ?? "Check the connection and try again."}</Text>
                <Button w="fit-content" bg="accent" color="accentFg" minH="44px" onClick={() => setReloadToken((value) => value + 1)}>
                  Try again
                </Button>
              </Stack>
            ) : null}
            {status === "empty" ? <EmptyFeed onResetFilters={clearFilters} /> : null}
            {status === "ready" || status === "partial" || status === "loadingMore" ? (
              <Stack gap="4">
                {pageInfo ? <ResultCount count={articles.length} mode={pageInfo.mode} /> : null}
                <ArticleList articles={articles} />
                {error ? (
                  <Text role="status" color="accent">
                    {error}
                  </Text>
                ) : null}
                {canLoadMore ? (
                  <Button
                    alignSelf="center"
                    minH="44px"
                    variant="outline"
                    borderColor="line"
                    disabled={status === "loadingMore"}
                    onClick={() => query && commit({ ...query, page: query.page + 1 })}
                  >
                    {status === "loadingMore" ? "Loading" : "Load more"}
                  </Button>
                ) : null}
              </Stack>
            ) : null}
          </Stack>
        }
      />
      <Drawer.Root open={filtersOpen} placement="start" onOpenChange={(details) => setFiltersOpen(details.open)}>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="paper" color="ink">
            <Drawer.Header>
              <Drawer.Title>Filters</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <FilterPanel query={fallbackQuery} sources={catalog} onChange={commit} />
            </Drawer.Body>
            <Drawer.Footer>
              <Button bg="accent" color="accentFg" minH="44px" onClick={() => setFiltersOpen(false)}>
                Apply
              </Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger />
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
      <Drawer.Root open={prefsOpen} placement="end" onOpenChange={(details) => setPrefsOpen(details.open)}>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="paper" color="ink">
            <Drawer.Header>
              <Drawer.Title>Your feed</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Stack gap="4">
                <Text color="muted">
                  This is what Folio opens on. It does not change the filters in the address bar until you save.
                </Text>
                <PreferencesForm
                  value={draft}
                  sources={catalog}
                  saving={false}
                  onChange={setDraft}
                  onSave={() => {
                    save(draft);
                    setPrefsOpen(false);
                  }}
                  onReset={() => {
                    reset();
                    setDraft(defaultPreferences);
                    setParams(new URLSearchParams(), { replace: true });
                    setKeyword("");
                    setPrefsOpen(false);
                  }}
                />
              </Stack>
            </Drawer.Body>
            <Drawer.CloseTrigger />
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  );
}

function classify(page: ArticlePage, total: number): FeedStatus {
  const errors = page.sources.filter((source) => source.status === "error");
  const allFailed = page.sources.length > 0 && errors.length === page.sources.length;
  if (total === 0 && allFailed) return "failed";
  if (total === 0) return "empty";
  if (errors.length > 0) return "partial";
  return "ready";
}

function mergeUnique(current: Article[], incoming: Article[]): Article[] {
  const next = [...current];
  for (const article of incoming) {
    if (!next.some((item) => item.id === article.id)) next.push(article);
  }
  return next;
}
