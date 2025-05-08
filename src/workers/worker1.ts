import amqp from 'amqplib';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Task } from '../models/task.model';

dotenv.config();


// isso daqui é um ponto interessante que gostaria de compartilhar.
// qual a dificuldade de vc escalar esses workers? toda vez que vc quiser adicionar ou retirar um worker vc vai criar outro arquivo?
// um worker não vai fazer a mesma coisa que o outro? se a resposta é sim, ou seja, a implementação é a mesma, basta vc reinstanciar
// o mesmo worker várias vezes. vou criar outro arquivo para mostrar isso. O nome do arquivo é worker_dynamic.ts


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
        // interessante deixar o nome notifications em uma constante ou algo do gênero
        channel.consume('notifications', async (msg) => {
            if (msg) {
                const taskData = JSON.parse(msg.content.toString());
                console.log(`👷 Worker1 processando task: ${taskData._id}`); // logs tops, mas é bom adicionar nível de debug. Em prod é bom evitar essas mensagens e logar apenas falhas


                // Atualizar status no Mongo para completed
                // é interessante chamar a API neste caso. Imagine que existe alguma regra de negócio na API, vc teria que refazer ela toda aqui
                // neste caso, seria interessante vc chamar a API que foi criada.

                // Resumindo, sempre que possível evite fazer alterações no banco quando há uma api padrão para ser chamada
                // Isso introduz uns erros bem cabulosos em produção.
                await Task.findByIdAndUpdate(taskData._id, { status: 'completed' });

                console.log(`✅ Task ${taskData._id} atualizada para completed`); // same here for the logs
                channel.ack(msg);
            }
        }, { noAck: false });

    } catch (error) {
        console.error('❌ Erro no worker:', error);
    }
}

startWorker();
