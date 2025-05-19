'use client'

import { AuthForm } from '@/components/auth-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: status } = await authApi.status();
        if (status?.success) {
          router.push('/dashboard');
        }
      } catch (error) {
        // Ошибка авторизации - остаемся на странице
      }
    };

    checkAuth();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">Yukasik</h1>
          <p className="text-xl text-gray-600">
            Улучшите качество вашего сна с помощью AI анализа и персональных рекомендаций
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Что это?</h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">💤</span>
                <span>Отслеживайте продолжительность и качество сна</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🧠</span>
                <span>Получайте персональные рекомендации от AI</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Анализируйте статистику и прогресс</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔒</span>
                <span>Ваши данные в безопасности</span>
              </li>
            </ul>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Вход в систему</CardTitle>
            </CardHeader>
            <CardContent>
              <AuthForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}