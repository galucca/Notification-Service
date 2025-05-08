import { Router, Request, Response } from 'express';
import { Task } from '../models/task.model';
import { publishToQueue } from '../queues/rabbitmq';


// na API é interessante separar regra de negócio, camada de persistência e camada de comunicação com o cliente
// Recomendação de leitura --> Clean Code e Clean Architecture
// 
const router = Router();

router.post('/tasks', async (req: Request, res: Response) => {
    try {
        const { plataforma, destinatario, remetente, conteudo } = req.body;
        
        // isso daqui é interessante, em casos que vc está querendo dizer para o cara que o payload está correto, vc faz a validação completa do payload
        // congrats
        if (!plataforma || !destinatario || !remetente || !conteudo) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const novaTask = new Task({
            plataforma,
            destinatario,
            remetente,
            conteudo,
            status: 'pending' // usar um enum aqui, comentei algo semelhante e mais detalhado nas linha 74 e 75 
        });

        const savedTask = await novaTask.save();
        publishToQueue(savedTask);

        // se não me engano existe uma lib com status em constantes, é uma boa usar elas ao invés do número puro
        // digo, é uma boa prática que gosto de seguir. Acredito que é melhor algo como HTTP.StatusCreated do que 201
        // além disso, deste caso, acredito que seja interessante um 202, status accepted. Pq na teoria a task não foi executada,
        // mas vc validou com perfeição se o body estava correto, então foi aceito. Porém, o 201 está correto também, é mais uma frescura minha kk

        return res.status(201).json(savedTask);
    } catch (error) {
        // está correto! e parabéns por não retornar o erro da aplicação para o usuário! isso é mto bom
        // por exemplo, imagine que é uma rota de login, e vc retorna. usuário correto, porém senha inválida.
        // honestamente, eu ia arrebentar o sistema com brute force só trocando a senha, especialmente se não tiver rate limiter para me barrar kkkkkkk
        // ou o sistema cai com o DDOS ou por que eu advinhei a senha kkkk
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
        
        // é interessante salvar esses status dentro de um enum ou em constantes. fica mais facil para se trabalhar e garante que não
        // haverá nenhum typo como peding ou pendin. Fora que ajuda a localizar os locais em que são chamados
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
