const amqp = require('amqplib');

let channel, connection;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('✅ RabbitMQ Connected!');
    return channel;
  } catch (err) {
    console.error('❌ RabbitMQ Error:', err.message);
    process.exit(1);
  }
}

function getChannel() {
  if (!channel) throw new Error('RabbitMQ not initialized');
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };