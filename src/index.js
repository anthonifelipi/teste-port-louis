import { textJson, listFiles, readFile, writeFile } from "./utils/fs/index.js";
import { balance } from "./utils/balance/index.js";

const ordersList = await listFiles("./Pedidos");
const notesList = await listFiles("./Notas");

const report = [];
const notesDetails = [];
const ordersDetails = [];

for (const orderFileName of ordersList) {
  try {
    const dataFile = await readFile(`./Pedidos/${orderFileName}`);
    console.log(dataFile);
    let itemNumbers = dataFile.map((data) => {
      ordersSchemaVerification(data);
      return data["número_item"];
    });

    itemsNumberVerification(itemNumbers);
    ordersDetails.push({
      id_pedido: orderFileName.replace(".txt", "").replace("P", ""),
      data: dataFile,
    });
  } catch (error) {
    console.error({
      message: "error",
      order: orderFileName.replace(".txt", ""),
      ...error,
    });
    break;
  }
}

console.log(notesDetails);

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
