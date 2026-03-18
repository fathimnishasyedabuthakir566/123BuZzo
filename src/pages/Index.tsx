import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, Shield, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BusCard } from "@/components/bus";
import { busService } from "@/services/busService";
import { useTranslation } from "react-i18next";
import type { Bus as BusType } from "@/types";
import { cn } from "@/lib/utils";

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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
                Live Bus Tracking for Tirunelveli
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                {t("hero_title_1")}{" "}
                <span className="gradient-text">{t("hero_title_2")}</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                {t("hero_subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/buses">
                  <Button variant="hero" size="xl">
                    <Bus className="w-5 h-5" />
                    {t("track_buses_now")}
                  </Button>
                </Link>
                <Link to="/bus-directory">
                  <Button variant="hero-outline" size="xl">
                    <MapPin className="w-5 h-5" />
                    {t("bus_directory")}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  {t("free_to_use")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  {t("real_time_updates")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  {t("driver_verified")}
                </div>
              </div>
            </div>

            {/* Hero Visual - Live Terminal Preview */}
            <div className="relative hidden lg:block animate-scale-in">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-[3rem] blur-2xl opacity-50" />
              <div className="relative bg-[#0a0c10] border border-slate-800 rounded-[2.5rem] shadow-2xl p-6 overflow-hidden min-h-[500px]">
                {/* Terminal Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Bus className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-sm tracking-tight uppercase">Live Terminal Board</h3>
                      <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest">Tirunelveli Junction</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest animate-pulse">Live</span>
                  </div>
                </div>

                {/* Mini Metric Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800/50">
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Active</p>
                    <p className="text-2xl font-black text-white">24</p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800/50">
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">On Time</p>
                    <p className="text-2xl font-black text-emerald-500">92%</p>
                  </div>
                </div>

                {/* Sample Board Rows */}
                <div className="space-y-3">
                  {[
                    { no: "TN67-102", to: "Madurai", time: "10:15", status: "Arriving", color: "text-emerald-500" },
                    { no: "TN72-452", to: "Kanyakumari", time: "10:30", status: "On-Route", color: "text-amber-500" },
                    { no: "TN68-888", to: "Tuticorin", time: "10:45", status: "Delayed", color: "text-rose-500" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-slate-800/30">
                      <div>
                        <p className="text-[10px] text-slate-500 font-black tracking-widest">{row.no}</p>
                        <p className="text-sm font-bold text-white uppercase">{row.to}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-400">{row.time}</p>
                        <p className={cn("text-[10px] font-black uppercase", row.color)}>{row.status}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Radar Scan Decoration */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 border border-teal-500/20 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 border border-teal-500/10 rounded-full animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Fleet Radar (New Section) */}
      <section className="py-24 relative bg-[#06080c] overflow-hidden">
        <div className="section-container">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
                <MapPin className="w-3 h-3" /> System Intelligence
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                Real-Time <span className="text-primary italic text-6xl block mt-2">Fleet Radar</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed">
                Experience the power of real-time geospatial intelligence. Monitor every bus across the Tirunelveli network with sub-second latency and precise driver-verified coordinates.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div>
                  <p className="text-4xl font-black text-white mb-1">98%</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tracking Accuracy</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-primary mb-1">&lt;1s</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Update Latency</p>
                </div>
              </div>

              <Link to="/auth?mode=register">
                <Button variant="hero" className="w-full sm:w-auto h-16 px-10 rounded-2xl group">
                  Connect to Network
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[3rem] p-2 shadow-2xl relative">
              <div className="absolute top-8 right-8 z-20 flex flex-col gap-2">
                <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  84 Active Units
                </div>
              </div>
              <div className="aspect-[16/9] bg-slate-800 rounded-[2.5rem] overflow-hidden relative">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center brightness-50 contrast-125" />
                 <div className="absolute inset-0 bg-primary/10 mix-blend-color" />
                 
                 {/* Simulated Map Markers */}
                 <div className="absolute top-1/2 left-1/3 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.5)] border-2 border-white animate-bounce">
                    <Bus className="w-4 h-4 text-white" />
                 </div>
                 <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.5)] border-2 border-white animate-bounce [animation-delay:-0.2s]">
                    <Bus className="w-4 h-4 text-white" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arrivals & Departures Header */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="section-container flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" /> Current Departures
                </h3>
                <p className="text-sm font-medium text-slate-500">Live board for upcoming services from the main terminal</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="h-10 px-4 flex items-center gap-2 bg-white rounded-full border border-slate-200">
                 <span className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
              </div>
              <div className="h-10 px-4 flex items-center gap-2 bg-white rounded-full border border-slate-200">
                 <span className="w-2 h-2 rounded-full bg-amber-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delayed</span>
              </div>
           </div>
        </div>
      </section>
      {/* Homepage Metrics Summary */}
      <section className="py-12 bg-white">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Bus className="w-6 h-6" />
               </div>
               <p className="text-3xl font-black text-slate-800">24</p>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Live Services</p>
            </div>
            <div className="glass-card p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6" />
               </div>
               <p className="text-3xl font-black text-slate-800">18</p>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">On Route</p>
            </div>
            <div className="glass-card p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
               <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
               </div>
               <p className="text-3xl font-black text-slate-800">2</p>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Delays Reported</p>
            </div>
            <div className="glass-card p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
               <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
               </div>
               <p className="text-3xl font-black text-slate-800">100%</p>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">System Health</p>
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
