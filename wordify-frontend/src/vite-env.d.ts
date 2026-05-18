/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

declare module "*.webp" {
  const src: string;
  export default src;
}
