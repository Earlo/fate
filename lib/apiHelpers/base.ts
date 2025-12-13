export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const response = await fetch(input, init);
  return (await response.json()) as T;
}
