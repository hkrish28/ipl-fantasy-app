import { AppProps } from 'next/app';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';


export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
