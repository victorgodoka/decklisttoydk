/**Hypergeometric analysis for calculating the probability
 * of drawing hand combos in Yu-Gi-Oh.
 * Math and initial code by AntiMetaman.
 * Code cleaned by wSedlacek*/
const { cartesianProduct } = window.Combinatorics;

/**
 * Creates an array starting from the offset, defaulting at 0 and ending at the length
 * @param {number} end
 * @param {number} start
 */
const range = (end, start = 0) =>
  Array.from({ length: (end - start) + 1 }, (_, i) => i + start);

/**
 * Factorial function. Computes the x!
 * @param {number} x
 */
const fact = (x) => {
  let result = 1;
  for (let i = 2; i <= x; i++)  result *= i;

  return result;
}

/**
 * computes the binomial coefficient (n, k) or ways to choose k elements from a set of n
 * @param {number} n
 * @param {number} k
 */
const binomial = (n, k) => fact(n) / (fact(n - k) * fact(k));

/**
 * Adds two numbers together, used as a helper for .reduce() to total arrays
 * @param {number} a
 * @param {numbers} b
 */
const toTotal = (a, b) => a + b;

/**Rounds to 4 decimal places*/
const round = (x) => Number.parseFloat(x).toFixed(5);

/**
 *
 * @param {number[]} copies number of items selected in the dropdown. (This is a vector when it's a n>1 card combo.)
 * @param {number[]} min minimum number selected by user. Usually 1. (This is a vector when it's a n>1 card combo.)
 * @param {number[]} max maximum number of cards from the number of copies that user wants in their hand. (This is a vector when it's a n>1 card combo.)
 * @param {number} handSize number of cards user will draw from deck. Also called sampling size.
 * @param {number} deckSize number of cards in the deck that the user has imported
 */
const comboCalc = (copies, min, max, handSize, deckSize) => {
  const ranges = range(copies.length - 1).map((i) => range(max[i], min[i]));
  const permutations = cartesianProduct(...ranges).toArray();

  const totalCopies = copies.reduce(toTotal, 0);

  let sum = 0;
  for (const args of permutations) {
    const argsTotal = args.reduce(toTotal, 0);
    const argBinomials = args.map((arg, i) => binomial(copies[i], arg));
    sum += argBinomials.reduce((acc, result) => acc * result, binomial(deckSize - totalCopies, handSize - argsTotal));
  }

  return sum / binomial(deckSize, handSize);
}


//Example of user input. Each combo sends different parameters. The probability of each is calculated and then the total probability is outputed. This way, a player knows exactly how consistent their deck can be given all the possible optimal hands they want. Ideally, a deck should have above 60% hance to draw the hands they want. If lower than this number, then the player needs to adjust his/her ratios or add more combos to their deck.
const combo1 = comboCalc([3, 3, 6, 3, 3, 3, 2], [1, 0, 2, 0,1, 0, 0], [3, 3, 6, 3,3,3,2], 5, 40);

const combo2 = comboCalc([2, 3, 4, 2], [0, 1, 1, 1], [2, 3, 4, 2], 5, 40);

const combo3 = comboCalc([3, 3, 6, 10, 5], [1, 1, 1, 1, 1], [1, 1, 1,1,1], 5, 40);

totalprob=combo1+combo2+combo3;

console.log("The probability of opening Combo 1 in your hand is "+round(combo1*100)+"%.")

console.log("The probability of opening Combo 2 in your hand is "+round(combo2*100)+"%.")

console.log("The probability of opening Combo 3 in your hand is "+round(combo3*100)+"%.")

console.log("The total probability of drawing any of the above combos is "+round(totalprob*100)+"%.")