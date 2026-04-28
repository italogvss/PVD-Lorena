import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date) =>
  format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
