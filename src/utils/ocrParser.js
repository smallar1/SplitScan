/**
 * Heuristically parses raw OCR text from a receipt to extract items, tax, and tip.
 * 
 * @param {string} text - Raw text from OCR scan.
 * @returns {Object} Parsed receipt data containing items, tax, and tip.
 */
export function parseReceiptText(text) {
  if (!text) {
    return { items: [], tax: 0, tip: 0 };
  }

  const lines = text.split('\n');
  const items = [];
  let tax = 0;
  let tip = 0;

  // Heuristic regex to match prices (e.g. 10.99, 5,50, $14.00, 1. 20)
  const priceRegex = /([0-9]+\s*[\.,]\s*[0-9]{2})/;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const match = trimmed.match(priceRegex);
    if (match) {
      const rawPrice = match[1];
      // Normalize price string: remove whitespace and substitute comma for decimal dot
      const price = parseFloat(rawPrice.replace(/\s/g, '').replace(',', '.'));
      
      if (isNaN(price)) return;

      // Extract raw item name by stripping out price and currency indicators
      let name = trimmed.replace(rawPrice, '').replace('$', '').trim();
      
      // Clean up common receipt OCR artifacts
      name = name.replace(/^[\d\s]+[xX*]?\s+/, ''); // Remove quantity prefix (e.g., "1x ", "2* ", "1 ")
      name = name.replace(/[\s\-\.\#\:\*\|]+$/, '').replace(/^[\s\-\.\#\:\*\|]+/, '').trim(); // Remove leading/trailing symbols

      const lowerLine = trimmed.toLowerCase();

      // Heuristic 1: Detect Tax
      if (/\b(tax|gst|vat|sales tax|cgst|sgst)\b/i.test(lowerLine)) {
        tax = price;
        return;
      }

      // Heuristic 2: Detect Tip
      if (/\b(tip|gratuity|service charge)\b/i.test(lowerLine)) {
        tip = price;
        return;
      }

      // Heuristic 3: Exclude total and payment details
      if (/\b(total|subtotal|sub-total|net|balance|cash|change|due|card|visa|mastercard|amex|paid|tendered|merchant|auth)\b/i.test(lowerLine)) {
        return;
      }

      // Heuristic 4: Add valid food line items
      if (name.length > 1 && price > 0) {
        items.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          price
        });
      }
    }
  });

  return {
    items,
    tax,
    tip
  };
}
