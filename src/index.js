import { textJson, listFiles, readFile, writeFile } from "./utils/fs/index.js";
import { balance } from "./utils/balance/index.js";
import { ordersSchema, typeNumberVerify } from "./utils/schemas/index.js";

const ordersList = await listFiles("./Pedidos");
const notesList = await listFiles("./Notas");
const invoicesDetails = [];

// const report = [];
const notesDetails = [];
const ordersDetails = [];

for (const orderFileName of ordersList) {
  try {
    const dataFile = await readFile(`./Pedidos/${orderFileName}`);
    let itemNumbers = dataFile.map((data) => {
      ordersSchema(data);
      return data["número_item"];
    });

    let idOrder = orderFileName.replace(".txt", "").replace("P", "");
    verificationItems(itemNumbers, idOrder);
    ordersDetails.push({ id_pedido: idOrder, data: dataFile });
  } catch (error) {
    console.error({
      message: "Error processing order",
      order: orderFileName.replace(".txt", ""),
      error: error.message || error,
    });
    continue;
  }
}

function verificationItems(itemsNumber, idOrder) {
  const itemNumbersSorted = itemsNumber.sort((a, b) => a - b);
  const noRepetitionsItemNumbersList = itemNumbersSorted.filter(
    (item, index) => itemNumbersSorted.indexOf(item) === index
  );

  if (itemNumbersSorted.length !== noRepetitionsItemNumbersList.length) {
    throw new Error(`The order ${idOrder} has item numbers repeated`);
  }

  itemNumbersSorted.forEach((itemNumber, index) => {
    if (itemNumber !== index + 1) {
      throw new Error(`Missing item number ${index + 1} in order ${idOrder}`);
    }
  });
}

const report = ordersDetails.map((orderDetail) => {
  const reportData = balance(orderDetail, invoicesDetails);
  return {
    ...reportData,
    id_pedido: orderDetail.id_pedido,
  };
});

let errors = [];

if (errors.length > 0) {
  console.error("Errors encountered:", errors);
}

const finalReport = report.map((item) => {
  return {
    id_pedido: item.id_pedido,
    Valor_total_pedido: item.orderTotalValue,
    saldo_pendente: item.TotalValueOfMissingItems,
    items_pendentes: item.missingItems,
  };
});
const dataFinal = textJson(finalReport);

writeFile("Balanço.txt", dataFinal);
