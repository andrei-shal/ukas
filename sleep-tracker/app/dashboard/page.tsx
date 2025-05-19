'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SleepEntryForm } from '@/components/sleep-entry-form';
import { EntriesTable } from '@/components/entries-table';
import { authApi, entryApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SleepEntry, SleepStats } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [stats, setStats] = useState<SleepStats>({ avgDuration: 0, avgQuality: 0 });

  const fetchEntries = async () => {
    try {
      const { data: entriesData } = await entryApi.getEntries();
      setEntries(entriesData?.entries || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const authStatus = await authApi.status();
        if (!authStatus.data?.success) {
          router.push('/');
          return;
        }

        await fetchEntries();
      } catch (error) {
        router.push('/');
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  // Расчет статистики при изменении записей
  useEffect(() => {
    setStats(calculateSleepStats(entries));
  }, [entries]);

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      {/* Заголовок и кнопки */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link href="/analytics" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Аналитика
            </Button>
          </Link>
          <SleepEntryForm onEntryAdded={fetchEntries} />
        </div>
      </div>

      {/* Статистика - теперь в одну колонку на мобильных */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <Card className="min-h-[120px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">Средняя продолжительность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-4xl font-bold">
              {stats.avgDuration.toFixed(1)}h
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">Качество</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
              {stats.avgQuality.toFixed(1)}/10
            </div>
            <Progress value={stats.avgQuality * 10} className="h-2 sm:h-1" />
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">Лучшее</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bestNight ? (
              <div className="space-y-0.5 sm:space-y-1">
                <div className="text-sm sm:text-base font-medium">
                  {formatDate(stats.bestNight.start)}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Оценка: {stats.bestNight.rate}/10
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Нет данных</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Таблица записей с горизонтальной прокруткой на мобильных */}
      <Card>
        <CardHeader>
          <CardTitle>Записи</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <div className="min-w-[600px] sm:min-w-0">
              <EntriesTable entries={entries} onEntryDeleted={fetchEntries} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}