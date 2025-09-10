// Decode
function atou(str: string) {
    return decodeURIComponent(escape(atob(str)));
}

export function decodeBase64(str: string): string {
  return atou(str)
}