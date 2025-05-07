import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    plataforma: string;
    destinatario: string;
    remetente: string;
    conteudo: string;
    status: string;
    createdAt: Date;
}

const TaskSchema: Schema = new Schema({
    plataforma: { type: String, required: true },
    destinatario: { type: String, required: true },
    remetente: { type: String, required: true },
    conteudo: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);
