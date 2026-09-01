// CSS imported via raw-loader returns string content
declare module '*.css' {
  const content: string;
  export default content;
}

// Static asset type declarations for gulp-based SPFx projects
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
