/**
 * Given an array of products, returns the names of the top `n` categories
 * ranked by product count (descending).
 *
 * @param {Array<{category: string}>} products
 * @param {number} n - how many top categories to return (default 2)
 * @returns {string[]}
 */
export function getTopCategories(products, n = 2) {
  const counts = {};
  for (const product of products) {
    counts[product.category] = (counts[product.category] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([category]) => category);
}
