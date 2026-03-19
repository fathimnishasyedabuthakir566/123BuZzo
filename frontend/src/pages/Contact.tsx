import { Layout } from "@/components/layout";
import { Mail, MessageSquare, MapPin, Send, Star, Quote, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Contact = () => {
  const testimonials = [
    {
      name: "Anjali Sharma",
      role: "College Student",
      text: "BusTrack has completely changed how I commute of St. Xavier's. No more waiting in the sun or rain – I just check the live radar!",
      rating: 5
    },
    {
      name: "Karthik Raja",
      role: "IT Professional",
      text: "The precision of the ETA is amazing. It allows me to spend an extra 10 minutes at home with family instead of rushing to the terminal.",
      rating: 5
    },
    {
      name: "Meera Bai",
      role: "Daily Traveler",
      text: "Serving Tirunelveli with such smart technology is a blessing. It makes public transport feel very professional and reliable.",
      rating: 4
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen pt-20 pb-16">
        {/* Header Section */}
        <section className="container mx-auto px-4 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 mb-6">
            <MessageSquare className="w-4 h-4" /> Get In Touch
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Share Your <span className="text-primary italic">Journey</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Your feedback helps us make Tirunelveli's public transport smarter. Share your experiences, suggestions, or report any issues.
          </p>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column: Info & Testimonials */}
            <div className="lg:col-span-1 space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                   Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Email Us</p>
                      <p className="text-sm font-bold text-slate-700">support@bustrack-tvl.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Hub Location</p>
                      <p className="text-sm font-bold text-slate-700">Tirunelveli Junction Terminal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commuter Feedback Section */}
              <div className="pt-8 space-y-6">
                <h3 className="text-xl font-black text-slate-800">What Commuters Say</h3>
                <div className="space-y-4">
                  {testimonials.map((t, i) => (
                    <div key={i} className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                      <Quote className="absolute top-4 right-4 w-12 h-12 text-slate-100 -rotate-12 transition-transform group-hover:rotate-0" />
                      <div className="flex gap-1 mb-3">
                        {[...Array(t.rating)].map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 italic mb-4 relative z-10 font-medium">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{t.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Google Form Iframe */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-2xl border border-slate-100 h-full min-h-[800px] flex flex-col">
                <div className="flex items-center justify-between mb-8 px-4">
                   <div>
                      <h2 className="text-2xl font-black text-slate-900">Experience Survey</h2>
                      <p className="text-sm text-slate-500 font-medium">Help us evolve with your insights.</p>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                      <Send className="w-6 h-6" />
                   </div>
                </div>
                
                <div className="flex-1 rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 relative min-h-[600px]">
                  {/* Google Form Placeholder/Iframe */}
                  <iframe 
                    src="https://docs.google.com/forms/d/e/1FAIpQLScyv49Aea9YhL3_sO8q9r9FhX-F19f1X8YhL3_sO8q9r9FhX/viewform?embedded=true" 
                    width="100%" 
                    height="100%" 
                    className="absolute inset-0 border-0"
                    title="Commuter Experience Form"
                  >
                    Loading…
                  </iframe>
                </div>

                <div className="mt-8 text-center bg-primary/5 p-6 rounded-3xl border border-primary/10">
                   <p className="text-sm font-bold text-primary mb-2">Prefer direct contact?</p>
                   <p className="text-xs text-slate-500">Reach our terminal office at Platform 4, Tirunelveli BS for immediate assistance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
