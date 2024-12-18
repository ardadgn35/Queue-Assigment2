const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://localhost";
const PAYMENT_QUEUE = "paymentQueue";
const NOTIFICATION_QUEUE = "notificationQueue";

async function sendToQueue(queueName, payload) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });
  console.log(`Bildirim ${queueName} kuyruğuna eklendi:`, payload);
  await channel.close();
  await connection.close();
}

async function processPayments() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(PAYMENT_QUEUE, { durable: true });

  console.log("Ödeme servisi çalışıyor...");
  channel.consume(PAYMENT_QUEUE, async (message) => {
    if (message !== null) {
      const payment = JSON.parse(message.content.toString());
      console.log("Ödeme işlendi:", payment);

      const notificationPayload = {
        user: payment.user,
        message: "Ödemeniz başarıyla alındı.",
      };
      await sendToQueue(NOTIFICATION_QUEUE, notificationPayload);
      channel.ack(message);
    }
  });
}

processPayments();

