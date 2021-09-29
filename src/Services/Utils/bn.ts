import web3Utils from 'web3-utils'
import { Decimal } from 'decimal.js'

export const convertToBN = (value: number, decimals: number): string => {
  const baseBN = web3Utils.toBN(10)
  const baseDiff = 18 - decimals

  const valueToDecimal = new Decimal(value)
  const toFixedValue = valueToDecimal.toFixed(18)
  const valueInWeiBN = web3Utils.toBN(web3Utils.toWei(toFixedValue, 'ether'))
  let priceBN

  if (baseDiff >= 0) {
    priceBN = valueInWeiBN.div(baseBN.pow(web3Utils.toBN(baseDiff)))
  } else {
    priceBN = valueInWeiBN.mul(baseBN.pow(web3Utils.toBN(-baseDiff)))
  }
  return priceBN.toString()
}

export const convertFromBN = (value: string, decimals: number): string => {
  const baseDiff = 18 - decimals

  const valueInEther = web3Utils.fromWei(value.toString(), 'ether')
  let valueAdjusted

  if (baseDiff >= 0) {
    valueAdjusted = +valueInEther * Math.pow(10, baseDiff)
  } else {
    valueAdjusted = +valueInEther / Math.pow(10, baseDiff)
  }
  return valueAdjusted.toString()
}
