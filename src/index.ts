import express from 'express';
import taskRoutes from './api/task.routes';
import { connectDatabase } from './database';
import { connectRabbitMQ } from './queues/rabbitmq';

const app = express();
app.use(express.json());

app.use('/api', taskRoutes);

app.get('/', (req, res) => {
    res.send('API funcionando!');
});

const PORT = process.env.PORT || 3000;

async function start() {
    await connectDatabase();
    await connectRabbitMQ();
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

start();

