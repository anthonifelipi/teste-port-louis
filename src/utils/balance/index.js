function calculateUnitaryValue(order, number) {
  return Number(
    order.data
      .find((item) => item["número_item"] === Number(number))
      ["valor_unitário_produto"].replace(",", ".")
  );
}

function balanceItems(itemsBalance, order) {
  let missingInvoiceItems = false;
  let missingItems = [];
  let TotalValueOfMissingItems = 0;
  const totalValue = order.data
    .reduce((accumulator, currentItem) => {
      const currentItemValue =
        Number(currentItem["quantidade_produto"]) *
        Number(currentItem["valor_unitário_produto"].replace(",", "."));
      return accumulator + currentItemValue;
    }, 0)
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  for (const [item, balance] of Object.entries(itemsBalance)) {
    if (balance > 0) {
      missingInvoiceItems = true;
      missingItems.push({ número_item: item, saldo_quantidade: balance });

      const unitaryValue = calculateUnitaryValue(order, item);
      TotalValueOfMissingItems += balance * unitaryValue;
    } else if (balance < 0) {
      throw new Error(
        `Too many invoices for item number ${item} in order ${
          order["id_pedido"]
        }. Excess amount: ${-balance}`
      );
    }
  }

  TotalValueOfMissingItems = TotalValueOfMissingItems.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const report = {
    missingInvoiceItems,
    missingItems,
    tooManyItemsList: [],
    orderTotalValue: totalValue,
    TotalValueOfMissingItems,
  };

  return report;
}

export function balance(order, invoicesList) {
  const orderId = Number(order["id_pedido"]);

  const invoicesFiltered = invoicesList.filter((invoice) =>
    invoice.data.some((item) => item["id_pedido"] === orderId)
  );
  const invoiceIds = invoicesFiltered.map((invoice) => invoice.invoice);

  let itemsBalanceSummary = {};

  order.data.forEach((orderItem) => {
    const itemNumber = Number(orderItem["número_item"]);
    const orderedQuantity = Number(orderItem["quantidade_produto"]);

    const invoicedQuantity = invoicesFiltered
      .flatMap((invoice) => invoice.data)
      .filter(
        (invoiceItem) =>
          invoiceItem["id_pedido"] === orderId &&
          Number(invoiceItem["número_item"]) === itemNumber
      )
      .reduce((acc, cur) => acc + Number(cur["quantidade_produto"]), 0);

    itemsBalanceSummary[itemNumber] = orderedQuantity - invoicedQuantity;
  });

  let summary = itemsBalanceReport(itemsBalanceSummary, order);
  summary.invoices = invoiceIds;

  return summary;
}
