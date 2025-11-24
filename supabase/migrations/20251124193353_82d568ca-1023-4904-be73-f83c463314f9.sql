-- 創建角色枚舉類型
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- 創建用戶資料表
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  customer_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 創建用戶角色表
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 啟用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 創建安全定義函數來檢查角色（避免遞歸RLS問題）
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 創建檢查是否為管理員的便捷函數
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;

-- profiles 表的 RLS 策略
CREATE POLICY "用戶可以查看所有資料" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "用戶可以更新自己的資料" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "用戶可以插入自己的資料" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- user_roles 表的 RLS 策略
CREATE POLICY "管理員可以查看所有角色" 
  ON public.user_roles FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "用戶可以查看自己的角色" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "管理員可以管理所有角色" 
  ON public.user_roles FOR ALL 
  USING (public.is_admin(auth.uid()));

-- 創建自動更新 updated_at 的函數
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 profiles 表添加更新觸發器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 創建自動處理新用戶註冊的觸發器函數
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 插入 profile
  INSERT INTO public.profiles (id, username, email, customer_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'customer_code'
  );
  
  -- 插入默認角色（customer），如果元數據中指定了 role 則使用指定的角色
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer')
  );
  
  RETURN NEW;
END;
$$;

-- 為 auth.users 添加觸發器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();