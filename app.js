const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");

const app = express();
app.use(bodyParser.json());

const RABBITMQ_URL = "amqp://localhost";
const PAYMENT_QUEUE = "paymentQueue";

async function sendToQueue(queueName, payload) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });
  console.log(`Mesaj ${queueName} kuyruğuna eklendi:`, payload);
  await channel.close();
  await connection.close();
}

app.post("/make-payment", async (req, res) => {
  const { user, paymentType, cardNo } = req.body;

  if (!user || !paymentType || !cardNo) {
    return res.status(400).send("Eksik ödeme bilgisi!");
  }

  const paymentPayload = { user, paymentType, cardNo };
  await sendToQueue(PAYMENT_QUEUE, paymentPayload);

  res.status(202).send("Ödeme kuyruğa eklendi.");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Ödeme API'si http://localhost:${PORT} adresinde çalışıyor.`);
});
