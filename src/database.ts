import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        console.log('✅ MongoDB conectado!');
    } catch (error) {
        // seria interessante usar logger com diferentes níveis aqui e dar o throw ou como comentaste abaixo, um process.exit(1).
        console.error('❌ Erro ao conectar no MongoDB:', error);
        console.warn('⚠️ Atenção: Continuando execução SEM banco de dados.')
        // Não usamos process.exit(1), assim o servidor continua rodando
    }
}
