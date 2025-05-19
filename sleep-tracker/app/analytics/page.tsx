'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi, analyticsApi } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Loader2 } from 'lucide-react'

export default function Analytics() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Проверка авторизации
        const authStatus = await authApi.status()
        if (!authStatus.data?.success) {
          router.push('/')
          return
        }

        // Загрузка аналитики
        const response = await analyticsApi.getNotesForAll()
        setAnalytics(response.data.data || 'Нет данных для анализа')
      } catch (error) {
        console.error('Ошибка загрузки аналитики:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Аналитика сна</h1>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto">
              Назад в журнал
            </Button>
          </Link>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Общий анализ вашего сна</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : analytics ? (
            <div className="prose max-w-none">
              <ReactMarkdown>{analytics}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}