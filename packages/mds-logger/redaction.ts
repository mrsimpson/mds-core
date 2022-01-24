// TODO: This is an inefficient method, and we should be doing this in an external Pino transport (see PLAT-195)
export const redact = (arg: string | Record<string, unknown> | Error | undefined, keys: Set<string>) => {
  if (arg === undefined) return {}
  const res = JSON.stringify(arg instanceof Error ? { error: arg.toString() } : arg, (k, v) =>
    keys.has(normalize(k)) ? '[REDACTED]' : v
  )

  return JSON.parse(res)
}

export const normalize = (key: string) => key.toLowerCase().replace(/[^A-Za-z0-9]/, '')
