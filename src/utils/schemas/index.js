const orderKeysDefault = [
  "número_item",
  "código_produto",
  "quantidade_produto",
  "valor_unitário_produto",
];
const alfaNumericRegex = /^[0-9a-zA-Z]+$/;

function isNumber(value) {
  return typeof value === "number";
}

function isValidAlphanumeric(value) {
  return alfaNumericRegex.test(value);
}

function isValidFloat(value, maxDecimals) {
  return (
    !isNaN(parseFloat(value)) &&
    isFinite(value) &&
    hasMaxDecimals(value, maxDecimals)
  );
}

function hasMaxDecimals(value, maxDecimals) {
  return (value.toString().split(".")[1] || "").length <= maxDecimals;
}

export function ordersSchemaVerification(order, orderRow) {
  let errors = { row: orderRow + 1 };

  for (const key of orderKeysDefault) {
    if (!(key in order)) {
      errors[key] = "Missing key";
    }
  }

  if (!isNumber(order["número_item"])) {
    errors["número_item"] = "Must be a number";
  }

  if (!isValidAlphanumeric(order["código_produto"])) {
    errors["código_produto"] = "Must be an alphanumeric value";
  }

  if (!isNumber(order["quantidade_produto"])) {
    errors["quantidade_produto"] = "Must be a number";
  }

  if (!isValidFloat(order["valor_unitário_produto"], 2)) {
    errors["valor_unitário_produto"] =
      "Must be a maximum 2 decimals float number";
  }

  if (Object.keys(errors).length > 1) {
    throw errors;
  }
}
