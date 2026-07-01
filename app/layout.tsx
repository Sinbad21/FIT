import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { PwaRegister } from '@/components/PwaRegister';
import { SyncStatusBadge } from '@/components/SyncStatusBadge';
import { AppLock } from '@/components/AppLock';
export const metadata: Metadata = { title:'FitControl', description:'Personal fitness, nutrition and progress PWA.', manifest:'/manifest.webmanifest', appleWebApp:{capable:true,title:'FitControl',statusBarStyle:'black-translucent'}, icons:{icon:[{url:'/icons/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icons/icon-512.png',sizes:'512x512',type:'image/png'}], apple:'/icons/apple-touch-icon.png'} };
export const viewport: Viewport = { width:'device-width', initialScale:1, maximumScale:1, viewportFit:'cover', themeColor:'#111827' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="it"><body><PwaRegister/><AppLock/><SyncStatusBadge/><AppShell>{children}</AppShell></body></html>}