import amqp from 'amqplib';

let channel: amqp.Channel;

export async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('notifications', { durable: true });
        console.log('✅ Conectado ao RabbitMQ'); //caracteres unicode podem acabar não aparecendo a depender do terminal ou OS. Porém curti, ficou show
    } catch (error) {
        // seria interessante vc matar a aplicação em caso de não conectar. Digo, se a aplicação continuar viva ela não vai conseguir fazer nada já que a fila é obrigatória para o projeto funcionar
        // faz sentido vc, ou aplicar um sistema de retentativa de conexão. Tipo, adiciona um coeficiente de backoff (aumento exponêncial de tempo entre as retentativas)
        // e coloca um limite máximo de tempo de espera junto a um limite de retentativas. Não dando bom, retorne um erro (throw new).
        console.error('❌ Erro ao conectar ao RabbitMQ:', error); 

    }
}

export function publishToQueue(message: any) {
    if (!channel) {
        // Esse caso é o que comentei acima, a mensagem chega e não é salva em nenhum lugar
        // mesmo que fosse salvo em um cache na memória, por não haver retentativa de conexão com a fila, vc teria que matar o processo ou máquina
        // para conseguir se conectar novamente à fila. Limpando sua memória RAM.
        throw new Error('Canal RabbitMQ não inicializado.');
    }
    // boa, isso ficou show! lembrando, é bom na fila definir um TTL (Time To Live) para as mensagens (é um tempo de expiração). Caso contrário, fica mto sobrecarregado 
    channel.sendToQueue('notifications', Buffer.from(JSON.stringify(message)), { persistent: true }); 
    // isso é top, mas uma dica, em produção é interessante vc não ficar logando sempre casos de sucesso, é bom deixar para falhas.
    // nisso, entramos em outro ponto interessante, níveis de log.
    // um loger possui nível que são definidos nas variáveis de ambiente, sendo os mais usuáis. DEBUG, INFO, WARNING, CRITIAL
    // em suma, local ou dev vc tem log completo para debugar o código, em produção, vc se importa mais com logs como critial e info
    // ignorando DEBUG e WARNING
    console.log('📤 Mensagem enviada para fila:', message);
}
