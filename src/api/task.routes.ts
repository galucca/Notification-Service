import { Router, Request, Response } from 'express';
import { Task } from '../models/task.model';
import { publishToQueue } from '../queues/rabbitmq';

const router = Router();

router.post('/tasks', async (req: Request, res: Response) => {
    try {
        const { plataforma, destinatario, remetente, conteudo } = req.body;

        if (!plataforma || !destinatario || !remetente || !conteudo) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const novaTask = new Task({
            plataforma,
            destinatario,
            remetente,
            conteudo,
            status: 'pending'
        });

        const savedTask = await novaTask.save();
        publishToQueue(savedTask);


        return res.status(201).json(savedTask);
    } catch (error) {
        console.error('Erro ao criar task:', error);
        return res.status(500).json({ message: 'Erro interno ao criar task.' });
    }
});

router.get('/tasks', async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find();
        return res.json(tasks);
    } catch (error) {
        console.error('Erro ao listar tasks:', error);
        return res.status(500).json({ message: 'Erro interno ao listar tasks.' });
    }
});

router.get('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task não encontrada.' });
        }
        return res.json(task);
    } catch (error) {
        console.error('Erro ao buscar task:', error);
        return res.status(500).json({ message: 'Erro interno ao buscar task.' });
    }
});
router.patch('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        if (!['pending', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Status inválido. Use "pending" ou "completed".' });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Task não encontrada.' });
        }

        return res.json(task);
    } catch (error) {
        console.error('Erro ao atualizar task:', error);
        return res.status(500).json({ message: 'Erro interno ao atualizar task.' });
    }
});
router.delete('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task não encontrada.' });
        }

        return res.json({ message: 'Task deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar task:', error);
        return res.status(500).json({ message: 'Erro interno ao deletar task.' });
    }
});



export default router;
