import { useEffect } from "react";
import { useLocation } from "react-router";
import { pageTitle } from "@/config/brand";
import { myApex } from "@/store/myApex";

/** Sets the document title and records the visit in My Apex history. */
export function usePageMeta(title?: string, { record = true }: { record?: boolean } = {}) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = pageTitle(title);
    if (title && record) myApex.recordVisit(pathname, title);
  }, [title, pathname, record]);
}
