import { calculateSplit } from '../src/utils/calculator.js';

// Setup Mock Session
const mockSession = {
  items: [
    { id: 'pizza', name: 'Pizza Margherita', price: 12.00 },
    { id: 'burger', name: 'Cheeseburger', price: 10.00 },
    { id: 'fries', name: 'French Fries', price: 6.00 }
  ],
  claims: {
    'pizza': ['Alice', 'Bob'], // split Pizza (6 each)
    'burger': ['Bob'],          // Bob gets Burger (10)
    'fries': ['Alice']         // Alice gets Fries (6)
  },
  tax: 2.80,
  tip: 4.00,
  numPeople: 2
};

const results = calculateSplit(mockSession);

console.log('--- TEST RESULTS ---');
console.log('Food Subtotal:', results.foodSubtotal, '(Expected: 28)');
console.log('Tip per person:', results.tipPerPerson, '(Expected: 2)');

const alice = results.members['Alice'];
const bob = results.members['Bob'];

console.log('\nAlice Details:');
console.log('  Subtotal:', alice.subtotal, '(Expected: 12)');
console.log('  Tax Share:', alice.taxShare, '(Expected: 1.2)');
console.log('  Tip Share:', alice.tipShare, '(Expected: 2)');
console.log('  Grand Total:', alice.grandTotal, '(Expected: 15.2)');

console.log('\nBob Details:');
console.log('  Subtotal:', bob.subtotal, '(Expected: 16)');
console.log('  Tax Share:', bob.taxShare, '(Expected: 1.6)');
console.log('  Tip Share:', bob.tipShare, '(Expected: 2)');
console.log('  Grand Total:', bob.grandTotal, '(Expected: 19.6)');

// Verification Assertions
const errors = [];
if (results.foodSubtotal !== 28.00) errors.push('Food subtotal is incorrect');
if (results.tipPerPerson !== 2.00) errors.push('Tip per person is incorrect');
if (alice.subtotal !== 12.00) errors.push('Alice subtotal is incorrect');
if (alice.taxShare !== 1.20) errors.push('Alice tax share is incorrect');
if (alice.grandTotal !== 15.20) errors.push('Alice grand total is incorrect');
if (bob.subtotal !== 16.00) errors.push('Bob subtotal is incorrect');
if (bob.taxShare !== 1.60) errors.push('Bob tax share is incorrect');
if (bob.grandTotal !== 19.60) errors.push('Bob grand total is incorrect');

if (errors.length === 0) {
  console.log('\n✅ ALL MATHEMATICAL CALCULATIONS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('\n❌ TEST FAILED with errors:', errors);
  process.exit(1);
}
