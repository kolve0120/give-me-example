import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { StatCard } from "@/components/StatCard";
import { Zap, Shield, Sparkles, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15
          }}
        />
        <div className="absolute inset-0 bg-[var(--gradient-hero)] z-0" />
        
        <div className="container mx-auto px-4 z-10 text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
            打造您的
            <span className="text-gradient"> 數位未來</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            創新、快速、可靠的現代化解決方案，助您實現無限可能
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="lg" className="group">
              立即開始
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">核心優勢</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              我們提供最先進的技術和最優質的服務
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Zap}
              title="極速性能"
              description="優化的架構確保極速響應，提供流暢的使用體驗"
            />
            <FeatureCard
              icon={Shield}
              title="安全可靠"
              description="企業級安全保護，確保您的數據和隱私安全無虞"
            />
            <FeatureCard
              icon={Sparkles}
              title="創新設計"
              description="現代化的用戶界面，帶來耳目一新的視覺體驗"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <StatCard value="99.9%" label="穩定運行" />
            <StatCard value="10K+" label="活躍用戶" />
            <StatCard value="50+" label="企業客戶" />
            <StatCard value="24/7" label="技術支援" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 border border-border animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              準備好開始了嗎？
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              立即加入我們，體驗數位轉型帶來的全新可能性
            </p>
            <Button variant="hero" size="lg" className="group">
              免費試用
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
