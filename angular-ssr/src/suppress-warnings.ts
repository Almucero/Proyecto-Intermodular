const origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const s = typeof args[0] === 'string' ? args[0] : String(args[0] ?? '');
  if (s.includes('router deprecated') && s.includes('Promise-like')) return;
  origWarn.apply(console, args);
};
