// src/components/AuthModal.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useStore } from '@/hooks/useStore';
import { toast } from 'sonner';
import { UserRole } from '@/types/auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [customerCode, setCustomerCode] = useState('');
  
  const { login, register } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      const success = await login({ username, password });
      if (success) {
        toast.success('登入成功');
        onClose();
      } else {
        toast.error('登入失敗，請檢查帳號密碼');
      }
    } else {
      const success = await register({
        username,
        email,
        password,
        role,
        customerCode: role === 'customer' ? customerCode : undefined,
      });
      if (success) {
        toast.success('註冊成功');
        onClose();
      } else {
        toast.error('註冊失敗');
      }
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('customer');
    setCustomerCode('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? '登入' : '註冊'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">帳號</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">密碼</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label>角色</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">管理者</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer">客戶</Label>
                  </div>
                </RadioGroup>
              </div>

              {role === 'customer' && (
                <div className="space-y-2">
                  <Label htmlFor="customerCode">客戶編號</Label>
                  <Input
                    id="customerCode"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {mode === 'login' ? '登入' : '註冊'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                resetForm();
              }}
            >
              {mode === 'login' ? '註冊新帳號' : '返回登入'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
