import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface LoginFallbackProps {
  onLoginSuccess?: (userData: any) => void;
}

const LoginFallback: React.FC<LoginFallbackProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Here you would implement your fallback login logic
      // For example, a direct API call to your authentication endpoint
      // const response = await fetch('/api/auth/login', { method: 'POST', ... });
      
      // Simulate successful login for demonstration
      setTimeout(() => {
        // Generate a mock token
        const mockToken = btoa(JSON.stringify({
          sub: username,
          name: 'Test User',
          roles: ['user'],
          exp: Math.floor(Date.now() / 1000) + 3600 // expires in 1 hour
        }));
        
        // Mock user data
        const userData = { 
          username, 
          name: 'Test User',
          roles: ['user']
        };
        
        // Store auth info in session storage for API calls
        sessionStorage.setItem('authenticated', 'true');
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('token', JSON.stringify(mockToken));
        
        // Call the success callback if provided
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
        
        // Redirect to home or dashboard
        navigate('/');
        
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Fallback login system when Keycloak is unavailable
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleLogin} 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginFallback;
