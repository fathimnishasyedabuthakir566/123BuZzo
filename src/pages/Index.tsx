import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, Shield, Users, ArrowRight, CheckCircle2, Wifi } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BusCard } from "@/components/bus";
import { busService } from "@/services/busService";
import { useTranslation } from "react-i18next";
import type { Bus as BusType } from "@/types";

const Index = () => {
  const { t } = useTranslation();
  const [buses, setBuses] = useState<BusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const features = [
    {
      icon: MapPin,
      title: t("live_tracking"),
      description: "Track your bus location in real-time on an interactive map",
    },
    {
      icon: Clock,
      title: t("accurate_eta"),
      description: "Get precise arrival time updates from bus drivers",
    },
    {
      icon: Shield,
      title: t("reliable_updates"),
      description: "Driver-verified updates ensure accurate information",
    },
    {
      icon: Users,
      title: t("for_everyone"),
      description: "Easy to use for passengers and operators alike",
    },
  ];

  const benefits = [
    "No more waiting at bus stops wondering when the bus will arrive",
    "Plan your commute with accurate departure and arrival times",
    "Drivers update their location ensuring you get real information",
    "Works on all devices - phone, tablet, or computer",
  ];

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await busService.getAllBuses();
        setBuses(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch buses for home page:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuses();
  }, []);
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0d14]">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,148,136,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow stagger-3" />

        <div className="section-container relative z-10 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-md shadow-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                Live Transit Network Operational
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 italic">
                TRACK <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">EVERY</span> <br/>
                MOVE.
              </h1>

              <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Tirunelveli's most advanced bus tracking ecosystem. Real-time locations, smart ETA, and driver-verified updates in the palm of your hand.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <Link to="/buses">
                  <Button className="h-16 px-10 bg-teal-500 hover:bg-teal-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-teal-500/30 transform hover:-translate-y-1 transition-all">
                    <Bus className="w-5 h-5" />
                    Launch Tracker
                  </Button>
                </Link>
                <Link to="/bus-directory">
                  <Button variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs rounded-2xl backdrop-blur-md">
                    <MapPin className="w-5 h-5" />
                    Quick Search
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="mt-16 pt-16 border-t border-white/5 flex flex-wrap items-center gap-12 justify-center lg:justify-start">
                <div>
                   <p className="text-3xl font-black text-white">450+</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Buses</p>
                </div>
                <div>
                   <p className="text-3xl font-black text-white">12k</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Commuters</p>
                </div>
                <div>
                   <p className="text-3xl font-black text-white">99%</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tracking Accuracy</p>
                </div>
              </div>
            </div>

            {/* Hero Visual - Premium Map Preview */}
            <div className="relative group perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-tr from-teal-500/20 to-primary/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative glass-card border-white/10 p-2 rounded-[3rem] overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-700 shadow-2xl">
                 <div className="absolute inset-0 bg-slate-900/40 z-10" />
                 <img 
                   src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" 
                   alt="Transit System" 
                   className="w-full h-[600px] object-cover grayscale opacity-50 contrast-125"
                 />
                 
                 {/* Floating UI Elements over image */}
                 <div className="absolute top-12 left-12 z-20 space-y-4">
                    {[0, 1].map((i) => (
                       <div key={i} className={`p-6 premium-glass rounded-3xl w-72 animate-slide-up stagger-${i+2}`}>
                          <div className="flex justify-between items-center mb-4">
                             <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                <Bus className="w-5 h-5 text-teal-500" />
                             </div>
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bus {i === 0 ? '72N-1234' : '72N-5678'}</p>
                          <h4 className="font-black text-white tracking-tight">NELLAI EXPRESS</h4>
                       </div>
                    ))}
                 </div>

                 <div className="absolute bottom-12 right-12 z-20 p-8 premium-glass rounded-3xl w-80 text-center">
                    <Wifi className="w-8 h-8 mx-auto mb-4 text-teal-400 animate-pulse" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Live Sync Active</h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Real-time telemetry connection established across all fleet units.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="page-header mb-4">{t("why_use")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("why_use_desc")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center mx-auto mb-4 shadow-md">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="page-header mb-6">{t("simple_reliable")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("simple_reliable_desc")}
              </p>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link to="/buses" className="inline-block mt-8">
                <Button variant="accent" size="lg">
                  {t("start_tracking")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Buses Preview */}
            <div className="space-y-4">
              {buses.length > 0 ? (
                buses.map((bus, index) => (
                  <div
                    key={bus.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <BusCard {...bus} />
                  </div>
                ))
              ) : (
                <div className="glass-card p-12 text-center text-muted-foreground">
                  <p>Check "Track Buses" for all available routes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

        <div className="section-container relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {t("ready_to_never_miss")}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {t("join_thousands")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=register">
              <Button variant="glass" size="xl" className="bg-card text-foreground hover:bg-card/90">
                {t("create_free_account")}
              </Button>
            </Link>
            <Link to="/buses">
              <Button variant="hero-outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50">
                {t("browse_buses")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
