import amqp from 'amqplib';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Task } from '../models/task.model';

dotenv.config();

async function startWorker() {
    try {
        // Conectar no MongoDB
        await mongoose.connect(process.env.MONGO_URL!);
        console.log('✅ Worker conectado ao MongoDB');

        // Conectar no RabbitMQ
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue('notifications', { durable: true });
        console.log('✅ Worker conectado ao RabbitMQ');

        // Consumir mensagens
        channel.consume('notifications', async (msg) => {
            if (msg) {
                const taskData = JSON.parse(msg.content.toString());
                console.log(`👷 Worker1 processando task: ${taskData._id}`);

                // Atualizar status no Mongo para completed
                await Task.findByIdAndUpdate(taskData._id, { status: 'completed' });

                console.log(`✅ Task ${taskData._id} atualizada para completed`);
                channel.ack(msg);
            }
        }, { noAck: false });

    } catch (error) {
        console.error('❌ Erro no worker:', error);
    }
}

startWorker();
