import { getNotifications } from '@/actions/platform';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default async function NotificacoesPage() {
  const notifications = await getNotifications('vol-1');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Badge className="mb-4">Notificações</Badge>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter">Notificações</h1>
        <p className="text-gray-600 font-bold mt-3 max-w-3xl">Acompanhe alertas importantes por app, e-mail e WhatsApp.</p>
      </div>

      <div className="grid gap-6">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`border-2 rounded-none ${notification.read ? 'bg-white' : 'bg-[#fff9e6]'}`}>
            <CardContent className="p-6 grid gap-4 sm:grid-cols-[1fr_auto] items-center">
              <div>
                <div className="flex items-center gap-3 text-gray-700 font-bold">
                  <Bell className="w-5 h-5" />
                  <span>{notification.title}</span>
                </div>
                <p className="mt-3 text-gray-600">{notification.message}</p>
              </div>
              <div className="text-right text-sm font-bold text-gray-500">
                <div>{notification.channel.toUpperCase()}</div>
                <div className="mt-2">{new Date(notification.createdAt).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
