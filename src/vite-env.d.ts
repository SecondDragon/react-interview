/// <reference types="vite/client" />

declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*?raw' {
  const src: string;
  export default src;
}

declare module '*.html?raw' {
  const src: string;
  export default src;
}

declare module '*.ts?raw' {
  const src: string;
  export default src;
}
