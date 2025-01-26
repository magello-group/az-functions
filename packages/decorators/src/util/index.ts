export const capitalize = (...str: (string | undefined)[]) => {
  return str
    .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : ''))
    .join('')
}
