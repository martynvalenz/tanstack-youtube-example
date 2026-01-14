export const copyToClipboard = async (url: string) => {
  await navigator.clipboard.writeText(url)

  return
}
