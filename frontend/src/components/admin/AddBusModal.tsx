import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { busSchema, type BusFormData } from "@/lib/validations/bus";
import { Plus, Trash2, MapPin } from "lucide-react";

interface AddBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusFormData) => Promise<void>;
}

const AddBusModal = ({ isOpen, onClose, onSubmit }: AddBusModalProps) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      name: "",
      busNumber: "",
      routeFrom: "",
      routeTo: "",
      capacity: 40,
      ac: false,
      status: "not-started",
      intermediateStops: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "intermediateStops"
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: BusFormData) => {
    // Add order to stops
    const formattedData = {
      ...data,
      intermediateStops: data.intermediateStops?.map((stop, index) => ({
        ...stop,
        order: index + 1
      }))
    };
    await onSubmit(formattedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl animate-scale-in border border-border shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold text-foreground mb-4">Add New Bus</h2>
        <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary">General Information</h3>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Bus Name</label>
                <input {...register("name")} type="text" placeholder="e.g., Express" className="input-field w-full h-10 text-sm" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reg Number</label>
                <input {...register("busNumber")} type="text" placeholder="TN 72 AB 1234" className="input-field w-full h-10 text-sm" />
                {errors.busNumber && <p className="text-xs text-red-500 mt-1">{errors.busNumber.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Bus Type</label>
                  <select {...register("busType")} className="input-field w-full h-10 text-xs bg-background">
                    <option value="Mofussil">Mofussil</option>
                    <option value="Town Bus">Town Bus</option>
                    <option value="Express">Express</option>
                    <option value="AC">AC</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Service</label>
                  <select {...register("serviceType")} className="input-field w-full h-10 text-xs bg-background">
                    <option value="Ordinary">Ordinary</option>
                    <option value="Express">Express</option>
                    <option value="1to1">1to1</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Origin</label>
                  <input {...register("routeFrom")} type="text" className="input-field w-full h-10 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Destination</label>
                  <input {...register("routeTo")} type="text" className="input-field w-full h-10 text-sm" />
                </div>
              </div>
            </div>

            {/* Stops Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Route Stops</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[10px] font-bold"
                  onClick={() => append({ name: "", lat: 8.7139, lng: 77.7567, order: fields.length + 1 })}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Stop
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-3 bg-secondary/30 rounded-xl border border-border/50 space-y-2 relative group">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                         {index + 1}
                       </div>
                       <input 
                         {...register(`intermediateStops.${index}.name`)} 
                         placeholder="Stop Name" 
                         className="bg-transparent border-none focus:ring-0 text-sm font-bold flex-1 p-0" 
                       />
                       <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-md border border-border/50">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <input {...register(`intermediateStops.${index}.lat`)} type="number" step="0.0001" placeholder="Lat" className="bg-transparent border-none p-0 text-[10px] w-full focus:ring-0" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-md border border-border/50">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <input {...register(`intermediateStops.${index}.lng`)} type="number" step="0.0001" placeholder="Lng" className="bg-transparent border-none p-0 text-[10px] w-full focus:ring-0" />
                      </div>
                    </div>
                  </div>
                ))}
                {fields.length === 0 && (
                  <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                    <MapPin className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No stops added</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-1 h-12 rounded-xl font-bold" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Register System Bus"}
            </Button>
          </div>
        </form>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AddBusModal;
