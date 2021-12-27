/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly DEV: boolean,
  readonly VITE_API_V1_BASE_URL: string,
}

// eslint-disable-next-line
interface ImportMeta {
  readonly env: ImportMetaEnv,
}