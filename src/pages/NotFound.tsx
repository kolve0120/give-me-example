import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-elegant flex items-center justify-center p-4">
      <Card className="card-elegant max-w-md w-full animate-fade-in">
        <div className="p-8 text-center space-y-6">
          <AlertTriangle className="w-20 h-20 text-warning mx-auto" />
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <h2 className="text-xl font-semibold text-muted-foreground">頁面不存在</h2>
            <p className="text-muted-foreground">
              抱歉，您要尋找的頁面不存在或已被移動。
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = "/"}
              className="btn-primary w-full gap-2"
            >
              <Home className="w-4 h-4" />
              回到首頁
            </Button>
            
            <div className="text-sm text-muted-foreground">
              錯誤路徑: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
