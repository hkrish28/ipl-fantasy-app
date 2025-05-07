import { useState } from 'react';
import { useRouter } from 'next/router';
import { signUp } from '@/lib/auth';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await signUp(email, password, name);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSignUp} className="p-6 space-y-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <input
        className="w-full p-2 border"
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full p-2 border"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 border"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
        Create Account
      </button>
    </form>
  );
}
