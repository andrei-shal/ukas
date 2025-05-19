'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { z } from 'zod';

const formSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

type FormData = z.infer<typeof formSchema>;

export function AuthForm({ isRegister = false }: { isRegister?: boolean }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isRegister) {
        await authApi.signup(data);
        toast.success('Успешная регистрация', {
          description: 'Теперь вы можете войти в систему',
        });
        router.push('/');
      } else {
        const response = await authApi.signin(data);
        
        // Проверяем успешность входа
        if (response.data?.success) {
          toast.success('Вход выполнен успешно');
          
          // 1. Обновляем состояние аутентификации
          // 2. Перенаправляем на защищенную страницу
          router.push('/dashboard');
          
          // Важно: принудительно обновляем данные страницы
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Ошибка', {
        description: error.response?.data?.errors?.[0] || error.message || 'Произошла ошибка',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Остальная часть формы остается без изменений */}
      <div className="space-y-2">
        <Label htmlFor="username">Имя пользователя</Label>
        <Input
          id="username"
          placeholder="Введите имя пользователя"
          {...register('username')}
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          placeholder="Введите пароль"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting 
          ? isRegister ? 'Регистрация...' : 'Вход...' 
          : isRegister ? 'Зарегистрироваться' : 'Войти'}
      </Button>

      {!isRegister && (
        <div className="text-center text-sm text-gray-500">
          Нет аккаунта?{' '}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => router.push('/signup')}
          >
            Зарегистрироваться
          </button>
        </div>
      )}
    </form>
  );
}