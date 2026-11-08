export async function api(url, options = {}) {
  let response;
  try {
    response = await fetch('/api' + url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
  } catch {
    throw new Error('Cannot reach the server.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The request failed.');
  return data;
}
