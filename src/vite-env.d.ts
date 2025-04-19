/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_SCHEDULING_LINK_1?: string; // Optional
  readonly VITE_SCHEDULING_LINK_2?: string; // Optional
  readonly VITE_SCHEDULING_LINK_3?: string; // Optional
  readonly VITE_QUERY_PARAM_LAST_NAME?: string; // Optional
  readonly VITE_QUERY_PARAM_FIRST_NAME?: string; // Optional
  readonly VITE_QUERY_PARAM_FULL_NAME?: string; // Optional
  readonly VITE_QUERY_PARAM_DEPARTMENT?: string; // Optional
  readonly VITE_QUERY_PARAM_COMPANY?: string; // Optional
  readonly VITE_QUERY_PARAM_EMAIL?: string; // Optional
  readonly VITE_QUERY_PARAM_PHONE?: string; // Optional (New)
  // 他の環境変数をここに追加できます
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
