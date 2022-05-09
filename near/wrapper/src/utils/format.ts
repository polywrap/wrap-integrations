/**
 * Exponent for calculating how many indivisible units are there in one NEAR. See {@link NEAR_NOMINATION}.
 */
export const NEAR_NOMINATION_EXP = 24;

export function parseNearAmount(input: String): String {
  const amount: String = cleanupAmount(input.toString());
  const split = amount.split(".");
  const wholePart = split[0];
  const fracPart = split[1] || "";
  if (split.length > 2 || fracPart.length > NEAR_NOMINATION_EXP) {
    throw new Error(`Cannot parse '${amount}' as NEAR amount`);
  }
  const result = trimLeadingZeroes(wholePart + fracPart.padEnd(NEAR_NOMINATION_EXP, "0"));
  return result; // BigInt.fromString(result);
}

export function formatNearAmount(input: String): String {
  const balance = input;
  const wholeStr = balance.substring(0, balance.length - NEAR_NOMINATION_EXP) || "0";
  const fractionStr = balance
    .substring(balance.length - NEAR_NOMINATION_EXP)
    .padStart(NEAR_NOMINATION_EXP, "0")
    .substring(0, NEAR_NOMINATION_EXP);

  const result = trimTrailingZeroes(`${formatWithCommas(wholeStr)}.${fractionStr}`);
  return result; //BigInt.fromString(result);
}

function cleanupAmount(amount: String): String {
  //TODO replace after implementation:  Not implemented: Regular expressions
  // return amount.replace(/,/g, "").trim();
  return amount.replace(",", "").trim();
}

function trimTrailingZeroes(value: String): String {
  //TODO replace after implementation:  Not implemented: Regular expressions
  // return value.replace(/\.?0*$/, "");
  const split = value.split(".");
  if (split.length > 1) {
    const int = split[0];
    let decimals = split[1];
    for (let i = decimals.length - 1; i > 0; i--) {
      if (decimals[i] === "0") {
        decimals = decimals.slice(0, i);
      } else {
        break;
      }
    }
    return `${int}.${decimals}`;
  }
  return value;
}

function trimLeadingZeroes(value: String): String {
  //TODO replace after implementation:  Not implemented: Regular expressions
  // value = value.replace(/^0+/, "");
  // if (value === "") {
  //   return "0";
  // }
  let result = value;
  for (let i = 0; i < result.length; i++) {
    if (result[i] === "0") {
      result = result.slice(i + 1);
    } else {
      break;
    }
  }
  return value;
}

function formatWithCommas(value: String): String {
  //TODO replace after implementation:  Not implemented: Regular expressions
  // const pattern = /(-?\d+)(\d{3})/;
  // while (pattern.test(value)) {
  //   value = value.replace(pattern, "$1,$2");
  // }
  if (value === "0") return "0";
  const reversed = value.split("").reverse().join("");
  let result: String[] = [];
  for (let i = 1; i <= reversed.length; i++) {
    result.push(reversed[i - 1]);
    if (i % 3 === 0) {
      if (i !== reversed.length) result.push(",");
    }
  }

  return result.reverse().join("");
}
