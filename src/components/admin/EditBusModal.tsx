import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Bus } from "@/types";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { busSchema, type BusFormData } from "@/lib/validations/bus";
import { Plus, Trash2, MapPin } from "lucide-react";

interface EditBusModalProps {
    isOpen: boolean;
    bus: Bus | null;
    onClose: () => void;
    onSubmit: (id: string, data: Partial<Bus>) => Promise<void>;
}

const EditBusModal = ({ isOpen, bus, onClose, onSubmit }: EditBusModalProps) => {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BusFormData>({
        resolver: zodResolver(busSchema),
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "intermediateStops"
    });

    useEffect(() => {
        if (bus) {
            reset({
                name: bus.name,
                busNumber: bus.busNumber,
                routeFrom: bus.routeFrom,
                routeTo: bus.routeTo,
                capacity: bus.capacity || 40,
                ac: bus.ac || false,
                status: bus.status,
                platformNumber: bus.platformNumber,
                busType: bus.busType,
                serviceType: bus.serviceType,
                depot: bus.depot,
                driverName: bus.driverName,
                driverPhone: bus.driverPhone,
                conductorName: bus.conductorName,
                conductorPhone: bus.conductorPhone,
                intermediateStops: bus.intermediateStops || []
            });
        }
    }, [bus, reset]);

    if (!isOpen || !bus) return null;

    const onFormSubmit = async (data: BusFormData) => {
        const formattedData = {
            ...data,
            intermediateStops: data.intermediateStops?.map((stop, index) => ({
                ...stop,
                order: index + 1
            }))
        };
        await onSubmit(bus.id, formattedData as any);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-2xl animate-scale-in border border-border shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h2 className="text-xl font-bold text-foreground mb-4">Edit System Bus</h2>
                <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Basic Info Column */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">General Information</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Bus Name</label>
                                    <input {...register("name")} type="text" className="input-field w-full h-10 text-sm" />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Reg Number</label>
                                    <input {...register("busNumber")} type="text" className="input-field w-full h-10 text-sm" />
                                    {errors.busNumber && <p className="text-xs text-red-500 mt-1">{errors.busNumber.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                                    <select {...register("status")} className="input-field w-full h-10 text-xs bg-background">
                                        <option value="on-time">On Time</option>
                                        <option value="delayed">Delayed</option>
                                        <option value="arriving">Arriving</option>
                                        <option value="departed">Departed</option>
                                        <option value="not-started">Not Started</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <input {...register("ac")} type="checkbox" id="acEdit" className="mr-2 h-4 w-4" />
                                    <label htmlFor="acEdit" className="text-xs font-medium text-foreground">AC</label>
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
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Driver Info</label>
                                <div className="flex gap-2">
                                    <input {...register("driverName")} placeholder="Name" className="input-field w-full h-10 text-sm" />
                                    <input {...register("driverPhone")} placeholder="Phone" className="input-field w-full h-10 text-sm" />
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
                                            <div className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
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
                                                <input {...register(`intermediateStops.${index}.lat`)} type="number" step="0.0001" placeholder="Lat" className="bg-transparent border-none p-0 text-[10px] w-full focus:ring-0" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-md border border-border/50">
                                                <input {...register(`intermediateStops.${index}.lng`)} type="number" step="0.0001" placeholder="Lng" className="bg-transparent border-none p-0 text-[10px] w-full focus:ring-0" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-border">
                        <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="accent" className="flex-1 h-12 rounded-xl font-bold" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Bus Record"}
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

export default EditBusModal;
