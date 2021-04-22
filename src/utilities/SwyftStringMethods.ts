/**
 * COnvert first character of a given word to uppercase
 * @param word
 * @returns
 */
const toUppercaseFirst = (word: string) =>
  `${word.charAt(0).toUpperCase()}${word.slice(1, word.length)}`;

export default toUppercaseFirst;
