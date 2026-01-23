const formatFetchError = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        return `${response.status} ${response.statusText}: ${data.error}`;
      }
      return `${response.status} ${response.statusText}: ${JSON.stringify(data)}`;
    }
    const text = await response.text();
    return `${response.status} ${response.statusText}${text ? `: ${text}` : ''}`;
  } catch {
    return `${response.status} ${response.statusText}`;
  }
};

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await formatFetchError(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return (await response.text()) as unknown as T;
  }
  return (await response.json()) as T;
}

export async function fetchOk(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  return response.ok;
}
