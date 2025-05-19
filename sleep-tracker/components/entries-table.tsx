'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { entryApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SleepEntry, SleepStats } from '@/lib/types';

interface EntriesTableProps {
  entries: SleepEntry[];
  onEntryDeleted: () => void;
}

export function EntriesTable({ entries = [], onEntryDeleted }: EntriesTableProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      await entryApi.deleteEntry(id);
      toast.success('Запись удалена');
      onEntryDeleted();
    } catch (error) {
      toast.error('Ошибка при удалении записи');
    }
  };

  if (!entries || entries.length === 0) {
    return <div className="text-gray-500">Нет записей</div>;
  }

  // Фильтруем некорректные записи
  const validEntries = entries.filter(entry => 
    entry && 
    entry.id && 
    entry.start && 
    entry.end && 
    !isNaN(new Date(entry.start).getTime()) && 
    !isNaN(new Date(entry.end).getTime())
  );

  if (validEntries.length === 0) {
    return <div className="text-gray-500">Нет записей</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Дата</TableHead>
          <TableHead>Продолжительность</TableHead>
          <TableHead>Качество</TableHead>
          <TableHead>Пометки</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {validEntries.map((entry) => {
          const startDate = new Date(entry.start);
          const endDate = new Date(entry.end);
          const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

          return (
            <TableRow key={entry.id}>
              <TableCell>
                {startDate.toLocaleDateString()}
              </TableCell>
              <TableCell>
                {durationHours.toFixed(1)}h
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    entry.rate >= 7 ? 'default' :
                    entry.rate >= 4 ? 'secondary' : 'destructive'
                  }
                >
                  {entry.rate}/10
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {entry.notes || '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                >
                  Удалить
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// Исправленная функция calculateSleepStats
export function calculateSleepStats(entries: SleepEntry[] = []): SleepStats {
  // Фильтруем некорректные записи
  const validEntries = entries.filter(entry => 
    entry && 
    entry.start && 
    entry.end && 
    !isNaN(new Date(entry.start).getTime()) && 
    !isNaN(new Date(entry.end).getTime()) && (typeof entry.rate === 'number')
  );

  if (validEntries.length === 0) {
    return { avgDuration: 0, avgQuality: 0 };
  }

  const durations = validEntries.map(entry => {
    const start = new Date(entry.start).getTime();
    const end = new Date(entry.end).getTime();
    return (end - start) / (1000 * 60 * 60);
  });

  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const avgQuality = validEntries.reduce((sum, entry) => sum + entry.rate, 0) / validEntries.length;

  const bestNight = [...validEntries].sort((a, b) => b.rate - a.rate)[0];
  const worstNight = [...validEntries].sort((a, b) => a.rate - b.rate)[0];

  return { 
    avgDuration, 
    avgQuality, 
    bestNight, 
    worstNight 
  };
}