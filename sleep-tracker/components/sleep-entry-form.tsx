'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { entryApi, analyticsApi } from '@/lib/api';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const formSchema = z.object({
  start: z.string().min(1, 'Обязательное поле'),
  end: z.string().min(1, 'Обязательное поле'),
  rate: z.coerce.number().min(1, 'Оценка должна быть от 1 до 10').max(10, 'Оценка должна быть от 1 до 10'),
  notes: z.string().optional(),
});

interface SleepEntryFormProps {
  onEntryAdded: () => void;
}

export function SleepEntryForm({ onEntryAdded }: SleepEntryFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start: '',
      end: '',
      rate: 5,
      notes: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setAiResponse(null);

      const startDate = new Date(values.start);
      const endDate = new Date(values.end);

      if (startDate >= endDate) {
        toast.error('Время окончания должно быть позже времени начала');
        return;
      }

      // Создаем новый AbortController для запроса
      abortControllerRef.current = new AbortController();

      // Устанавливаем таймаут для запроса (например, 30 секунд)
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          toast.error('Запрос занял слишком много времени');
          setIsLoading(false);
        }
      }, 30000);

      // 1. Добавляем запись о сне
      const entryResponse = await entryApi.addEntry(
        {
          start: startDate,
          end: endDate,
          rate: values.rate,
          notes: values.notes || '',
        }
      );

      if (!entryResponse.data?.entryId) {
        throw new Error('Не удалось получить ID записи');
      }

      toast.success('Запись добавлена');
      form.reset();
      onEntryAdded();

      // 2. Получаем анализ от ИИ
      const aiResponse = await analyticsApi.getNotes(
        entryResponse.data.entryId
      );

      if (!aiResponse.data?.data) {
        throw new Error('Не удалось получить анализ сна');
      }

      setAiResponse(aiResponse.data.data);

      // Очищаем таймаут, так как запрос успешно завершен
      clearTimeout(timeoutId);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Запрос был отменен');
      } else {
        console.error('Error:', error);
        toast.error(error.message || 'Произошла ошибка');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info('Запрос отменен');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAiResponse(null);
    form.reset();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Добавить запись</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{aiResponse ? 'Анализ сна' : 'Добавить запись о сне'}</DialogTitle>
        </DialogHeader>

        {aiResponse ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg prose prose-sm max-w-none">
              <h3 className="font-bold mb-2">Рекомендации по вашему сну:</h3>
              <ReactMarkdown>{aiResponse}</ReactMarkdown>
            </div>
            <Button onClick={handleClose} className="w-full">
              Закрыть
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Начало сна *</Label>
              <Input
                type="datetime-local"
                {...form.register('start')}
                disabled={isLoading}
              />
              {form.formState.errors.start && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.start.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Конец сна *</Label>
              <Input
                type="datetime-local"
                {...form.register('end')}
                disabled={isLoading}
              />
              {form.formState.errors.end && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.end.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Оценка сна (1-10) *</Label>
              <Input
                type="number"
                min="1"
                max="10"
                {...form.register('rate')}
                disabled={isLoading}
              />
              {form.formState.errors.rate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.rate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Пометки</Label>
              <Textarea
                {...form.register('notes')}
                placeholder="Опишите, как прошел ваш сон"
                disabled={isLoading}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Анализируем ваш сон...
                  </>
                ) : (
                  'Сохранить'
                )}
              </Button>
              {isLoading && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Отменить
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}