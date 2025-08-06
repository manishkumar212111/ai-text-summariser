export interface BrowserInfo {
  name: string;
  version: number;
}

export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    return { name: 'node', version: 0 };
  }

  const userAgent = navigator.userAgent;
  
  // Chrome detection
  let match = userAgent.match(/Chrome\/(\d+)/);
  if (match) return { name: 'chrome', version: parseInt(match[1]) };
  
  // Firefox detection
  match = userAgent.match(/Firefox\/(\d+)/);
  if (match) return { name: 'firefox', version: parseInt(match[1]) };
  
  // Safari detection
  match = userAgent.match(/Version\/(\d+).*Safari/);
  if (match) return { name: 'safari', version: parseInt(match[1]) };
  
  return { name: 'unknown', version: 0 };
}
