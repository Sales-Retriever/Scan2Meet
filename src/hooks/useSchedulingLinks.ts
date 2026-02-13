import { useState, useCallback } from "react";

export interface SchedulingLink {
  id: string;
  label: string;
  url: string;
}

const STORAGE_KEY = "scheduling_links";
const MAX_LINKS = 3;

const loadLinks = (): SchedulingLink[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLinks = (links: SchedulingLink[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
};

export const useSchedulingLinks = () => {
  const [links, setLinks] = useState<SchedulingLink[]>(loadLinks);

  const addLink = useCallback((label: string, url: string) => {
    setLinks((prev) => {
      if (prev.length >= MAX_LINKS) return prev;
      const next = [...prev, { id: crypto.randomUUID(), label, url }];
      saveLinks(next);
      return next;
    });
  }, []);

  const updateLink = useCallback((id: string, label: string, url: string) => {
    setLinks((prev) => {
      const next = prev.map((link) =>
        link.id === id ? { ...link, label, url } : link
      );
      saveLinks(next);
      return next;
    });
  }, []);

  const removeLink = useCallback((id: string) => {
    setLinks((prev) => {
      const next = prev.filter((link) => link.id !== id);
      saveLinks(next);
      return next;
    });
  }, []);

  return { links, addLink, updateLink, removeLink, maxLinks: MAX_LINKS };
};
