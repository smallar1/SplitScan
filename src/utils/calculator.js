/**
 * Helper to round a number to 2 decimal places (currency standard).
 */
const round = (val) => Math.round((val + Number.EPSILON) * 100) / 100;

/**
 * Calculates the split details for all members of a receipt session.
 * 
 * @param {Object} session
 * @param {Array} session.items - List of items, e.g. [{ id: '1', name: 'Pizza', price: 12.00 }]
 * @param {Object} session.claims - Map of itemId -> array of claimer names, e.g. { '1': ['Alice', 'Bob'] }
 * @param {number} session.tax - Total tax amount, e.g. 2.40
 * @param {number} session.tip - Total tip amount, e.g. 5.00
 * @param {number} session.numPeople - Total splitters count (including host), e.g. 3
 * @returns {Object} Detailed calculation results per member and unclaimed items summary.
 */
export function calculateSplit({ items = [], claims = {}, tax = 0, tip = 0, numPeople = 1 }) {
  const foodSubtotal = round(items.reduce((sum, item) => sum + item.price, 0));
  const safeNumPeople = Math.max(1, numPeople);
  const tipPerPerson = round(tip / safeNumPeople);

  const result = {
    members: {},
    unclaimed: {
      subtotal: 0,
      taxShare: 0,
      items: []
    },
    foodSubtotal,
    totalTax: tax,
    totalTip: tip,
    tipPerPerson
  };

  // 1. Distribute food cost and compile item shares
  items.forEach(item => {
    const itemClaimers = claims[item.id] || [];
    const claimersCount = itemClaimers.length;

    if (claimersCount === 0) {
      // Unclaimed item goes to the unclaimed pool
      result.unclaimed.subtotal = round(result.unclaimed.subtotal + item.price);
      result.unclaimed.items.push(item);
    } else {
      // Share cost evenly among active claimers of this item
      const sharePrice = round(item.price / claimersCount);
      itemClaimers.forEach(name => {
        if (!result.members[name]) {
          result.members[name] = {
            name,
            subtotal: 0,
            taxShare: 0,
            tipShare: tipPerPerson,
            grandTotal: 0,
            items: []
          };
        }
        result.members[name].subtotal = round(result.members[name].subtotal + sharePrice);
        result.members[name].items.push({
          id: item.id,
          name: item.name,
          fullPrice: item.price,
          sharePrice,
          splitWithCount: claimersCount
        });
      });
    }
  });

  // 2. Prorate tax proportionally based on food subtotal share
  const safeFoodSubtotal = foodSubtotal || 1; // Prevent divide by zero

  Object.keys(result.members).forEach(name => {
    const member = result.members[name];
    member.taxShare = round((member.subtotal / safeFoodSubtotal) * tax);
    member.grandTotal = round(member.subtotal + member.taxShare + member.tipShare);
  });

  result.unclaimed.taxShare = round((result.unclaimed.subtotal / safeFoodSubtotal) * tax);

  return result;
}

/**
 * Calculates a single member's summary locally (useful for live UI rendering before syncing back).
 */
export function calculateMemberShare({ memberName, items = [], claimedItemIds = [], claims = {}, tax = 0, tip = 0, numPeople = 1 }) {
  const foodSubtotal = round(items.reduce((sum, item) => sum + item.price, 0));
  const safeNumPeople = Math.max(1, numPeople);
  const tipShare = round(tip / safeNumPeople);

  let subtotal = 0;

  claimedItemIds.forEach(itemId => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Get claimers from database claims and inject current user if not present
    const existingClaimers = claims[itemId] || [];
    const isActiveClaimer = existingClaimers.includes(memberName);
    const count = existingClaimers.length + (isActiveClaimer ? 0 : 1);

    subtotal = round(subtotal + (item.price / Math.max(1, count)));
  });

  const safeFoodSubtotal = foodSubtotal || 1;
  const taxShare = round((subtotal / safeFoodSubtotal) * tax);
  const grandTotal = round(subtotal + taxShare + tipShare);

  return {
    subtotal,
    taxShare,
    tipShare,
    grandTotal
  };
}
