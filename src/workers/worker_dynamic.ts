import mongoose from 'mongoose';
import amqp from 'amqplib';
import { Task } from '../models/task.model';

async function startWorker(workerId: number) {
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        console.log(`✅ Worker${workerId} conectado ao MongoDB`);

        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue('notifications', { durable: true });
        console.log(`✅ Worker${workerId} conectado ao RabbitMQ`);

        channel.consume('notifications', async (msg) => {
            if (msg) {
                const taskData = JSON.parse(msg.content.toString());
                console.log(`👷 Worker${workerId} processando task: ${taskData._id}`);

                await Task.findByIdAndUpdate(taskData._id, { status: 'completed' });

                console.log(`✅ Worker${workerId} finalizou task: ${taskData._id}`);
                channel.ack(msg);
            }
        }, { noAck: false });

    } catch (error) {
        console.error(`❌ Erro no Worker${workerId}:`, error);
    }
}

// aqui embaixo estou chamando a mesma função 5 vezes. dentro do código apenas troquei para receber o workerId via parametro.
// porém, outro ponto importante, é sempre bom criar o arquivo e nunca declarar sua execução ao final como está aqui. isso dificulta muito debug
// então, nesse caso, neste arquivo deveria estar apenas a função e eu estar chamando em outro arquivo como no index.ts com esse for abaixo

//BONUS (não precisa quebrar a cabeça com esse último pq é bem pesado de inicio, só para saber que existe). 
// Se não me engano, o código acima ele não é bloqueante, ou seja, a thread de execução do seu programa
// não vai travar no for abaixo, porém, existem casos que o for nunca passaria do primeiro loop, por que a função simplesmente começou a ler a fila
// e travou lá. nestes casos, eu teria que rodar tudo e adicionar dentro de um promisse.all por exemplo fazendo ele bloquear a thread apenas ao final
// com todos os workers registrados à fila do rabbitmq

for (let i = 1; i <= 5; i++) {
    startWorker(i);
}

// BONUS 2 --> Dá para estudar o conceito de interface aqui, vc implentar uma classe que recebe uma inferface com o metodo run ou consume. 
// 
// Nisto, vc implementaria em esse código acima com o nome da interface e passaria para a classe pai. Só um conceito extra que é mais abstrato e confuso agora no ínício.