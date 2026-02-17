/**
 * Validates a numeric string using the Luhn (mod 10) algorithm.
 *
 * The South African ID number uses the Luhn algorithm to calculate its
 * 13th (checksum) digit. This function verifies that the entire 13-digit
 * string satisfies the Luhn property, i.e. that the total sum mod 10 === 0.
 *
 * @param digits - A string of numeric characters (the full 13-digit ID).
 * @returns `true` when the string passes the Luhn check, `false` otherwise.
 */
export function luhn(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  // Traverse from the rightmost digit to the left.
  for (let i = digits.length - 1; i >= 0; i--) {
    const char = digits[i];
    if (char === undefined) return false;

    let digit = parseInt(char, 10);
    if (isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
