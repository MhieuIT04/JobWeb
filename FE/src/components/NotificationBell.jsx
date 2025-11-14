// src/components/NotificationBell.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
<<<<<<< HEAD
import { Bell, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '../contexts/AuthContext';

function NotificationBell() {
    const { notifications, unreadCount, markNotificationRead, deleteNotification, markAllNotificationsRead } = useAuth();
=======
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function NotificationBell() {
    const { notifications, unreadCount } = useAuth();
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
<<<<<<< HEAD
                <Button variant="ghost" size="icon" className="relative focus-ring" aria-label="Thông báo">
=======
                <Button variant="ghost" size="icon" className="relative">
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge 
                            variant="destructive" 
<<<<<<< HEAD
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] animate-pulse"
                            aria-live="polite"
=======
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
<<<<<<< HEAD
            <DropdownMenuContent align="end" className="w-[320px] bg-white shadow-lg rounded-lg">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <DropdownMenuItem
                            key={notif.id}
                            className={`py-3 px-2 flex items-center justify-between gap-2 ${!notif.is_read ? 'bg-gray-50' : ''} hover:bg-gray-100 transition-colors rounded-md`}
                        >
                            <div
                                className="flex items-start gap-3 flex-1 cursor-pointer"
                                onClick={async () => {
                                    try {
                                        await markNotificationRead(notif.id);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                            >
                                <Avatar className="h-9 w-9">
                                    {notif.sender?.avatar ? (
                                        <AvatarImage src={notif.sender.avatar} />
                                    ) : (
                                        <AvatarFallback>
                                            <Bell className="w-4 h-4" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="min-w-0">
                                    <div className={`text-sm ${!notif.is_read ? 'font-semibold text-neutral-800' : 'text-neutral-700'}`}>{notif.message}</div>
                                    {notif.created_at && (
                                        <div className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                        await deleteNotification(notif.id);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                className="ml-2 text-neutral-400 hover:text-red-500 p-2 rounded hover:bg-red-50"
                                aria-label="Xóa thông báo"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
=======
            <DropdownMenuContent align="end" className="w-[300px]">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <DropdownMenuItem key={notif.id} className="py-3">
                            <span className="text-sm">{notif.message}</span>
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>
                        <span className="text-sm text-muted-foreground">Không có thông báo mới.</span>
                    </DropdownMenuItem>
                )}
<<<<<<< HEAD
                {/* Xóa tất cả (tùy backend hỗ trợ): show only when there are notifications */}
                {notifications.length > 0 && (
                    <div className="px-3 py-2 border-t flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <button
                                className="text-sm text-primary hover:underline"
                                onClick={async () => {
                                    try {
                                        await markAllNotificationsRead();
                                    } catch (err) {
                                        console.error('Không thể đánh dấu tất cả là đã đọc', err);
                                    }
                                }}
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        </div>
                        <div>
                            <button
                                className="text-sm text-red-500 hover:underline"
                                onClick={async () => {
                                    if (!window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) return;
                                    // xóa lần lượt (simple fallback) — có thể thay bằng endpoint bulk nếu backend hỗ trợ
                                    for (const n of notifications) {
                                        try {
                                            await deleteNotification(n.id);
                                        } catch (err) {
                                            console.error('Không thể xóa thông báo', n.id, err);
                                        }
                                    }
                                }}
                            >
                                Xóa tất cả
                            </button>
                        </div>
                    </div>
                )}
=======
>>>>>>> 6f28acc886b08ac850b9b237ed7c2a8010966d5a
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NotificationBell;