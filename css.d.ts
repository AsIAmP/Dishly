// Type declarations for CSS imports so `tsc --noEmit` resolves them.
// Metro/NativeWind handle these at bundle time; this only satisfies the type checker.
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
