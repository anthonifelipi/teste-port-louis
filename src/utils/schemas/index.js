const numericRegex = /^[0-9a-zA-Z]+$/;

export function typeNumberVerify(value, numberOfDecimals) {
  if (typeof value === "number") {
    value = value.toString();
  } else if (typeof value !== "string") {
    return false;
  }

  let [integerPart, decimalPart] = value.split(",");

  integerPart = Number(integerPart);
  decimalPart = decimalPart ? Number(decimalPart) : 0;
  if (
    isNaN(integerPart) ||
    isNaN(decimalPart) ||
    integerPart < 0 ||
    decimalPart < 0
  ) {
    return false;
  }

  if (decimalPart !== 0 && decimalPart.toString().length > numberOfDecimals) {
    return false;
  }

  return true;
}

const validationRules = {
  número_item: (value) => typeof value === "number",
  código_produto: (value) => numericRegex.test(value),
  quantidade_produto: (value) => typeof value === "number",
  valor_unitário_produto: (value) => typeNumberVerify(value, 2),
};

export function ordersSchema(order, orderRow) {
  const errors = {};

  for (const key of Object.keys(order)) {
    const validator = validationRules[key];
    if (!validator) {
      errors[key] = `Invalid key: ${key}`;
      continue;
    }

    if (!validator(order[key])) {
      errors[key] = `Invalid value for "${key}"`;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw { row: orderRow + 1, errors };
  }
}
