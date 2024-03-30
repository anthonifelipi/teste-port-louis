function valueUnitary(order, number) {
  const item = order.data.find(
    (item) => item["número_item"] === Number(number)
  );
  if (!item) {
    console.error(
      `Item number ${number} not found in order ${order["id_pedido"]}`
    );
    return 0;
  }
  const unitaryValue = Number(item["valor_unitário_produto"].replace(",", "."));

  if (isNaN(unitaryValue)) {
    console.error(
      `Invalid unitary value for item number ${number} in order ${order["id_pedido"]}`
    );
    return 0;
  }

  return unitaryValue;
}

function balanceItems(itemsBalance, order) {
  let missingInvoiceItems = false;
  let missingItems = [];
  let missingItemsTotal = 0;

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

      const unitaryValue = valueUnitary(order, item);
      missingItemsTotal += balance * unitaryValue;
    } else if (balance < 0) {
      throw new Error(
        `Too many invoices for item number ${item} in order ${
          order["id_pedido"]
        }. Excess amount: ${-balance}`
      );
    }
  }

  const missingItemsStrings = missingItems.map(
    (item) =>
      `Número do Item: ${item.número_item}, Saldo Pendente: ${item.saldo_quantidade}`
  );

  missingItemsTotal = missingItemsTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const report = {
    missingInvoiceItems,
    missingItems: missingItemsStrings,
    tooManyItemsList: [],
    orderTotalValue: totalValue,
    missingItemsTotal,
  };

  return report;
}

export function balance(order, invoices) {
  const id = Number(order["id_pedido"]);
  let objectSummary = {};

  const invoicesFilter = invoices.filter((invoice) =>
    invoice.data.some((item) => Number(item["id_pedido"]) === id)
  );
  const invoiceIds = invoicesFilter.map((invoice) => invoice.invoice);

  order.data.forEach((orderItem) => {
    const itemNumber = Number(orderItem["número_item"]);
    const quantityOrders = Number(orderItem["quantidade_produto"]);

    const quantityInvoices = invoicesFilter
      .flatMap((invoice) => invoice.data)
      .filter(
        (invoiceItem) =>
          Number(invoiceItem["id_pedido"]) === id &&
          Number(invoiceItem["número_item"]) === itemNumber
      )
      .reduce((acc, cur) => acc + Number(cur["quantidade_produto"]), 0);

    objectSummary[itemNumber] = quantityOrders - quantityInvoices;
  });

  let dataReturn = balanceItems(objectSummary, order);
  dataReturn.invoices = invoiceIds;

  return dataReturn;
}
