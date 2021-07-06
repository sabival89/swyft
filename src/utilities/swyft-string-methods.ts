/**
 * Convert the first character of a given word to uppercase
 * @param word The word to convert
 * @returns
 */
const toUppercaseFirst = (word: string) =>
  `${word.charAt(0).toUpperCase()}${word.slice(1, word.length)}`;

/**
 * Print a given value in currency format
 * @param amount The number value to be formatted
 * @returns
 */
const toCurrencyFormat = (amount: number) =>
  amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

export { toUppercaseFirst, toCurrencyFormat };
