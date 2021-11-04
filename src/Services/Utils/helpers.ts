export const getScanLink = (address: string, networkId: number) => {
  if (networkId === 1) return `https://etherscan.io/address/${address}`
  if (networkId === 56 ) return `https://bscscan.com/address/${address}`
  if (networkId === 137 ) return `https://polygonscan.com/address/${address}`
}

export const shortenAddress = (address: string) => {
  const firstSymbols = address.slice(0, 6)
  const lastSymbols = address.slice(address.length-4, address.length)
  const result = `${firstSymbols}...${lastSymbols}`
  return result
}