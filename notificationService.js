const amqp = require("amqplib");

const RABBITMQ_URL = "amqp://localhost";
const NOTIFICATION_QUEUE = "notificationQueue";

async function processNotifications() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });

  console.log("Bildirim servisi çalışıyor...");
  channel.consume(NOTIFICATION_QUEUE, (message) => {
    if (message !== null) {
      const notification = JSON.parse(message.content.toString());
      console.log(`Bildirim gönderildi: ${notification.user} - ${notification.message}`);
      channel.ack(message);
    }
  });
}

processNotifications();
