// src/pages/UserManagement.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

export const UserManagement = () => {
  // TODO: 從 store 或 API 載入用戶列表
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      permissions: {
        canViewAllOrders: true,
        canEditAllOrders: true,
        canManageUsers: true,
      },
    },
  ]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'customer' as UserRole,
    customerCode: '',
  });

  const handleAddUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      username: formData.username,
      email: formData.email,
      role: formData.role,
      customerCode: formData.role === 'customer' ? formData.customerCode : undefined,
      permissions: {
        canViewAllOrders: formData.role === 'admin',
        canEditAllOrders: formData.role === 'admin',
        canManageUsers: formData.role === 'admin',
      },
    };
    
    setUsers([...users, newUser]);
    toast.success('用戶新增成功');
    resetForm();
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const updated = users.map(u => 
      u.id === editingUser.id
        ? {
            ...u,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            customerCode: formData.role === 'customer' ? formData.customerCode : undefined,
            permissions: {
              canViewAllOrders: formData.role === 'admin',
              canEditAllOrders: formData.role === 'admin',
              canManageUsers: formData.role === 'admin',
            },
          }
        : u
    );
    
    setUsers(updated);
    toast.success('用戶更新成功');
    resetForm();
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success('用戶刪除成功');
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      customerCode: user.customerCode || '',
    });
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      role: 'customer',
      customerCode: '',
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingUser ? '編輯用戶' : '新增用戶'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>帳號</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>角色</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理者</SelectItem>
                  <SelectItem value="customer">客戶</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'customer' && (
              <div className="space-y-2">
                <Label>客戶編號</Label>
                <Input
                  value={formData.customerCode}
                  onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={editingUser ? handleUpdateUser : handleAddUser}>
              {editingUser ? '更新' : '新增'}
            </Button>
            {editingUser && (
              <Button variant="outline" onClick={resetForm}>
                取消
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>用戶列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>帳號</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>客戶編號</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? '管理者' : '客戶'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.customerCode || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
