import { Link } from "react-router-dom";
import { 
  Bus, MapPin, Clock, Users, Heart, ArrowRight, CheckCircle2, 
  AlertCircle, Zap, Shield, Globe, Smartphone, BarChart3, 
  Sparkles, Coffee, Home, GraduationCap, Briefcase
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const About = () => {
  const coreValues = [
    {
      icon: Shield,
      title: "Reliability",
      desc: "Real-time bus information you can trust, updated directly by drivers."
    },
    {
      icon: Zap,
      title: "Transparency",
      desc: "Live tracking and precision ETAs to keep you informed at every step."
    },
    {
      icon: Users,
      title: "Community",
      desc: "Built specifically for Tirunelveli's diverse commuter needs."
    },
    {
      icon: Sparkles,
      title: "Innovation",
      desc: "Smart alerts and predictive features for a modern transit experience."
    }
  ];

  const journeySteps = [
    {
      time: "07:30 AM",
      action: "Checking BusTrack",
      desc: "Passenger checks the Live Radar while having breakfast.",
      icon: Coffee
    },
    {
      time: "07:45 AM",
      action: "Smart Alert Recieved",
      desc: "Phone vibrates: 'Bus TN 72 N 1801 is 500m away'.",
      icon: Smartphone
    },
    {
      time: "07:50 AM",
      action: "Perfect Timing",
      desc: "Arrival at the stop exactly as the bus pulls in.",
      icon: Home
    },
    {
      time: "08:15 AM",
      action: "Productive Commute",
      desc: "Settled in for the ride, stress-free and on schedule.",
      icon: Briefcase
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen pb-20 overflow-x-hidden">
        {/* Hero Section: Story-Driven */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden">
          <div className="absolute inset-0 bg-primary/[0.02] -z-10" />
          <div className="section-container relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 mb-8 animate-fade-in">
                <Sparkles className="w-3 h-3" /> Our Story
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight animate-scale-up">
                Every Bus Has a <span className="text-primary italic">Story</span>. <br />
                We Help You <span className="underline decoration-accent decoration-4 underline-offset-8">Catch It</span>.
              </h1>
              <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                BusTrack was born on the busy platforms of Tirunelveli Terminal. We saw commuters 
                waiting for hours, missing opportunities, and facing uncertainty. We decided to 
                bridge the gap between drivers and passengers.
              </p>

              {/* Data Flow Visual Concept */}
              <div className="relative mt-20 max-w-3xl mx-auto">
                <div className="absolute top-1/2 left-0 right-0 h-px border-t-2 border-dashed border-slate-200 -z-10 hidden md:block" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   {[
                     { icon: Bus, label: "Driver Starts", color: "bg-blue-500" },
                     { icon: Globe, label: "Cloud Processing", color: "bg-accent" },
                     { icon: MapPin, label: "GPS Updates", color: "bg-emerald-500" },
                     { icon: Smartphone, label: "Real-time Tracking", color: "bg-primary" }
                   ].map((item, idx) => (
                     <div key={idx} className="flex flex-col items-center gap-4 group">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:-translate-y-2 group-hover:scale-110", item.color)}>
                           <item.icon className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">{item.label}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem vs Solution: Split Journey */}
        <section className="py-24 bg-slate-50 relative overflow-hidden">
           <div className="section-container">
              <div className="grid md:grid-cols-2 gap-px bg-slate-200 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200">
                 {/* Before BusTrack */}
                 <div className="bg-white p-12 lg:p-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest mb-8">
                       <AlertCircle className="w-3 h-3" /> Before BusTrack
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">The Chaotic Commute</h2>
                    <div className="space-y-6">
                       {[
                         "Unpredictable bus timings and missing schedules",
                         "Long, exhausting waits at crowded terminals",
                         "Missing buses due to zero arrival visibility",
                         "Lack of communication during engine delays",
                         "High stress and uncertainty for daily travelers"
                       ].map((text, i) => (
                         <div key={i} className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center shrink-0 mt-1">
                               <div className="w-2 h-2 rounded-full bg-rose-400" />
                            </div>
                            <p className="text-slate-500 font-bold">{text}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* After BusTrack */}
                 <div className="bg-primary/5 p-12 lg:p-16 border-l border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                       <Sparkles className="w-32 h-32 text-primary" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-8">
                       <CheckCircle2 className="w-3 h-3" /> After BusTrack
                    </div>
                    <h2 className="text-3xl font-black text-primary mb-10 tracking-tight">Smart Public Transit</h2>
                    <div className="space-y-6">
                        {[
                         "Live location tracking on an interactive radar",
                         "Precise ETA predictions powered by driver data",
                         "Automatic proximity alerts before arrival",
                         "Direct status updates for delays or route changes",
                         "Predictable, stress-free morning commutes"
                        ].map((text, i) => (
                         <div key={i} className="flex items-start gap-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                            <p className="text-slate-800 font-black">{text}</p>
                         </div>
                        ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* How It Works: Step-based Process Flow */}
        <section className="py-24">
           <div className="section-container text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-20 tracking-tight">Visualized Engineering</h2>
              <div className="relative flex flex-col md:flex-row justify-center items-center gap-12 md:gap-0">
                 {/* Step 1 */}
                 <div className="flex-1 flex flex-col items-center relative z-10 w-full md:w-auto">
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-primary shadow-xl flex items-center justify-center mb-6">
                       <Bus className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">GPS Generation</h3>
                    <p className="text-sm text-slate-500 px-8">Drivers start trips and broadcast secure location packets.</p>
                 </div>

                 {/* Connector 1 */}
                 <div className="hidden md:block flex-1 h-1 bg-gradient-to-r from-primary/20 to-primary/60 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary" />
                 </div>

                 {/* Step 2 */}
                 <div className="flex-1 flex flex-col items-center relative z-10 w-full md:w-auto">
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-accent shadow-xl flex items-center justify-center mb-6">
                       <BarChart3 className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Cloud Analysis</h3>
                    <p className="text-sm text-slate-500 px-8">Our platform processes speed, traffic, and stop data.</p>
                 </div>

                 {/* Connector 2 */}
                 <div className="hidden md:block flex-1 h-1 bg-gradient-to-r from-primary/60 to-primary/20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary" />
                 </div>

                 {/* Step 3 */}
                 <div className="flex-1 flex flex-col items-center relative z-10 w-full md:w-auto">
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-emerald-500 shadow-xl flex items-center justify-center mb-6">
                       <Users className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Live Delivery</h3>
                    <p className="text-sm text-slate-500 px-8">Passengers receive live maps and instant arrival notifications.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Our Mission: Highlighted Statement */}
        <section className="py-24 bg-primary text-white relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-center -z-10" />
           <div className="section-container relative z-10">
              <div className="max-w-4xl mx-auto text-center mb-24">
                 <Heart className="w-16 h-16 text-accent mx-auto mb-8 animate-pulse" />
                 <blockquote className="text-3xl md:text-5xl font-black tracking-tight leading-tight italic">
                    "Our purpose is to make public transportation in Tirunelveli predictable, reliable, and entirely stress-free for every commuter."
                 </blockquote>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {coreValues.map((value, idx) => (
                    <div key={idx} className="p-8 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all group">
                       <value.icon className="w-8 h-8 text-accent mb-6 transition-transform group-hover:scale-110" />
                       <h4 className="text-xl font-black mb-2">{value.title}</h4>
                       <p className="text-sm text-white/70 font-medium">{value.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* A Day With BusTrack: Journey Timeline */}
        <section className="py-24">
           <div className="section-container">
              <div className="text-center mb-20">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">A Day With BusTrack</h2>
                 <p className="text-slate-500 font-medium">Experience the difference in every step of your journey.</p>
              </div>

              <div className="max-w-4xl mx-auto space-y-12 relative">
                 <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-slate-100 -translate-x-1/2 -z-10" />
                 
                 {journeySteps.map((step, idx) => (
                    <div key={idx} className={cn(
                       "flex flex-col md:flex-row items-center gap-8 relative",
                       idx % 2 !== 0 ? "md:flex-row-reverse" : ""
                    )}>
                       <div className="flex-1 w-full text-left md:text-center px-4 md:px-0">
                          <div className={cn(
                             "hidden md:block w-fit mx-auto",
                             idx % 2 !== 0 ? "md:ml-0 md:mr-auto md:text-left" : "md:mr-0 md:ml-auto md:text-right"
                          )}>
                             <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">{step.time}</p>
                             <h4 className="text-xl font-black text-slate-800 mb-2">{step.action}</h4>
                             <p className="text-sm text-slate-500 max-w-sm">{step.desc}</p>
                          </div>
                       </div>
                       
                       <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-100 shadow-xl flex items-center justify-center relative z-10 shrink-0">
                          <step.icon className="w-5 h-5 text-primary" />
                       </div>

                       <div className="flex-1 w-full block md:hidden">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{step.time}</p>
                          <h4 className="text-lg font-black text-slate-800 mb-1">{step.action}</h4>
                          <p className="text-sm text-slate-500">{step.desc}</p>
                       </div>

                       <div className="flex-1 hidden md:block" />
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Community Section */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
           <div className="section-container relative">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                 <div>
                    <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Built For <br /> <span className="text-primary italic">The Commuter Community</span></h2>
                    <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
                       BusTrack isn't just a tech platform; it's a commitment to the people of Tirunelveli. From students reaching 
                       Manonmaniam Sundaranar University to professionals commuting between Junction and Terminal – we are here for you.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md">
                             <GraduationCap className="w-6 h-6 text-primary" />
                          </div>
                          <span className="text-xs font-black text-slate-700 uppercase">Students</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md">
                             <Briefcase className="w-6 h-6 text-emerald-500" />
                          </div>
                          <span className="text-xs font-black text-slate-700 uppercase">Office Workers</span>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-white rounded-[3rem] p-8 shadow-xl flex flex-col justify-center items-center text-center animate-bounce-soft">
                       <p className="text-4xl font-black text-primary mb-2">32+</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Fleets</p>
                    </div>
                    <div className="aspect-square bg-accent rounded-[3rem] p-8 shadow-xl flex flex-col justify-center items-center text-center mt-12 animate-bounce-soft" style={{ animationDelay: '0.2s' }}>
                       <p className="text-4xl font-black text-white mb-2">15k+</p>
                       <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Community Users</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
           <div className="section-container">
              <div className="bg-gradient-hero rounded-[4rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-3xl">
                 <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                 <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 tracking-tighter">Revolutionizing Transit, Together.</h2>
                 <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto relative z-10 font-medium">Ready to change the way you move through the city?</p>
                 
                 <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                    <Link to="/dashboard">
                       <Button variant="glass" className="h-16 px-10 rounded-2xl bg-white text-primary font-black text-lg gap-3 hover:scale-105 transition-transform">
                          Track Buses Now
                          <ArrowRight className="w-6 h-6" />
                       </Button>
                    </Link>
                    <Link to="/auth?role=admin">
                       <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/30 text-white font-black text-lg hover:bg-white/10 transition-colors">
                          Register as Operator
                       </Button>
                    </Link>
                    <Link to="/contact">
                       <Button variant="ghost" className="h-16 px-10 rounded-2xl text-white font-black text-lg hover:bg-white/5 underline decoration-2 underline-offset-8">
                          Share Your Experience
                       </Button>
                    </Link>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
