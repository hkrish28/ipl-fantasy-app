import { useState } from 'react';
import { logIn } from '@/lib/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await logIn(email, password);
    router.push('/dashboard'); 
  }

  return (
    <>
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Log In</button>
    </form>
    <p>
    Don’t have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
  </p>
  </>
  );
}
