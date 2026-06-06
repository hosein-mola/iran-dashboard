export async function runCode(model: { Code: string }) {
  // Portable version for Next.js: uses fetch instead of Axios instance config.
  //
  // Set NEXT_PUBLIC_API_BASE_URL to point at your backend, e.g.:
  // NEXT_PUBLIC_API_BASE_URL="https://api.example.com"
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";
  const url = base ? `${base}/v1/code/execute/` : "/v1/code/execute/";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(model),
    });

    // Always attempt to return the backend response body (even on non-2xx),
    // matching the behavior of the original code.
    const data = await res.json().catch(() => null);
    if (data !== null) return data;

    return {
      success: false,
      error: `Failed to parse response JSON (HTTP ${res.status})`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}
