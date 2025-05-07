import amqp from 'amqplib';

let channel: amqp.Channel;

export async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('notifications', { durable: true });
        console.log('✅ Conectado ao RabbitMQ');
    } catch (error) {
        console.error('❌ Erro ao conectar ao RabbitMQ:', error);
    }
}

export function publishToQueue(message: any) {
    if (!channel) {
        throw new Error('Canal RabbitMQ não inicializado.');
    }
    channel.sendToQueue('notifications', Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log('📤 Mensagem enviada para fila:', message);
}
