import amqp from 'amqplib';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Task } from '../models/task.model';

dotenv.config();

async function startWorker() {
    try {
      
        await mongoose.connect(process.env.MONGO_URL!);
        console.log('✅ Worker conectado ao MongoDB');

        
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue('notifications', { durable: true });
        console.log('✅ Worker conectado ao RabbitMQ');

        
        channel.consume('notifications', async (msg) => {
            if (msg) {
                const taskData = JSON.parse(msg.content.toString());
                console.log(`👷 Worker3 processando task: ${taskData._id}`);

                
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
