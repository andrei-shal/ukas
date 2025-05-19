'use server'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/auth-form';
import Link from 'next/link';

export default async function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Создать аккаунт
          </h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Регистрация</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthForm isRegister />
            <div className="mt-4 text-center text-sm">
              Уже есть аккаунт?{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                Войти
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}