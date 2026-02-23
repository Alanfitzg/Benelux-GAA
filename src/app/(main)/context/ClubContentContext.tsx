"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface ContentItem {
  value: string;
  maxLength: number | null;
}

interface ClubContentContextType {
  clubId: string;
  content: Record<string, ContentItem>;
  isAdmin: boolean;
  isLoading: boolean;
  getContent: (
    pageKey: string,
    contentKey: string,
    defaultValue: string
  ) => string;
  saveContent: (
    pageKey: string,
    contentKey: string,
    value: string,
    maxLength?: number
  ) => Promise<boolean>;
}

const ClubContentContext = createContext<ClubContentContextType | null>(null);

interface ClubContentProviderProps {
  children: ReactNode;
  clubId: string;
  isAdmin?: boolean;
}

export function ClubContentProvider({
  children,
  clubId,
  isAdmin = false,
}: ClubContentProviderProps) {
  const [content, setContent] = useState<Record<string, ContentItem>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(`/api/club-content?clubId=${clubId}`);
        if (response.ok) {
          const data = await response.json();
          setContent(data.content || {});
        }
      } catch (error) {
        console.error("Failed to fetch club content:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [clubId]);

  const getContent = useCallback(
    (pageKey: string, contentKey: string, defaultValue: string): string => {
      const key = `${pageKey}.${contentKey}`;
      return content[key]?.value ?? defaultValue;
    },
    [content]
  );

  const saveContent = useCallback(
    async (
      pageKey: string,
      contentKey: string,
      value: string,
      maxLength?: number
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/club-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clubId,
            pageKey,
            contentKey,
            value,
            maxLength,
          }),
        });

        if (response.ok) {
          const key = `${pageKey}.${contentKey}`;
          setContent((prev) => ({
            ...prev,
            [key]: { value, maxLength: maxLength || null },
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to save content:", error);
        return false;
      }
    },
    [clubId]
  );

  return (
    <ClubContentContext.Provider
      value={{
        clubId,
        content,
        isAdmin,
        isLoading,
        getContent,
        saveContent,
      }}
    >
      {children}
    </ClubContentContext.Provider>
  );
}

export function useClubContent() {
  const context = useContext(ClubContentContext);
  if (!context) {
    throw new Error("useClubContent must be used within a ClubContentProvider");
  }
  return context;
}
