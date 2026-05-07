require('dotenv').config();
const { connectRabbitMQ, getChannel } = require('./config/rabbitmq');

async function test() {
  await connectRabbitMQ();
  const ch = getChannel();

  const queue = 'order_queue';
  await ch.assertQueue(queue, { durable: true });

  const order = { orderId: '001', product: 'Laptop', qty: 1 };
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(order)));
  console.log('📨 Order sent:', order);

  ch.consume(queue, (msg) => {
    console.log('📩 Order received:', JSON.parse(msg.content.toString()));
    ch.ack(msg);
  });
}

test();