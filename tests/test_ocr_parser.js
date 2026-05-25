import { parseReceiptText } from '../src/utils/ocrParser.js';

const sampleReceipt = `
   THE BURGER LOUNGE
   2026-05-24 19:42

   1x Truffle Fries          $9.50
   2x Classic Cheeseburger   $32.00
   1  IPA Craft Beer         $8.00
   
   SUBTOTAL: $49.50
   TAX 8.5%: $4.21
   TIP: $10.00
   TOTAL: $63.71
   VISA PAID: $63.71
   CHANGE: $0.00
`;

const result = parseReceiptText(sampleReceipt);

console.log('--- OCR PARSER TEST RESULTS ---');
console.log('Tax Parsed:', result.tax, '(Expected: 4.21)');
console.log('Tip Parsed:', result.tip, '(Expected: 10.00)');
console.log('Items Count:', result.items.length, '(Expected: 3)');

result.items.forEach((item, index) => {
  console.log(`  Item ${index + 1}: "${item.name}" -> $${item.price}`);
});

// Verification Assertions
const errors = [];
if (result.tax !== 4.21) errors.push(`Tax is incorrect: ${result.tax}`);
if (result.tip !== 10.00) errors.push(`Tip is incorrect: ${result.tip}`);
if (result.items.length !== 3) {
  errors.push(`Items count is incorrect: ${result.items.length}`);
} else {
  if (result.items[0].name !== 'Truffle Fries' || result.items[0].price !== 9.50) {
    errors.push(`Item 1 parsed incorrectly: ${JSON.stringify(result.items[0])}`);
  }
  if (result.items[1].name !== 'Classic Cheeseburger' || result.items[1].price !== 32.00) {
    errors.push(`Item 2 parsed incorrectly: ${JSON.stringify(result.items[1])}`);
  }
  if (result.items[2].name !== 'IPA Craft Beer' || result.items[2].price !== 8.00) {
    errors.push(`Item 3 parsed incorrectly: ${JSON.stringify(result.items[2])}`);
  }
}

if (errors.length === 0) {
  console.log('\n✅ ALL OCR PARSER TEST CASES PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('\n❌ TEST FAILED with errors:', errors);
  process.exit(1);
}
