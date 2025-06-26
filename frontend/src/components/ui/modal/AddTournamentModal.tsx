'use client';
import React, { useState, useEffect } from "react";
import { Button } from "lebify-ui";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FieldError from "@/components/helper/FieldError";
import { toast } from "react-toastify";
import { addTournament } from "@/lib/api/dashboard/tournaments";
import { getStadiumsByOwner } from "@/lib/api/dashboard/stadiums";
import { useUser } from "@/context/UserContext";

interface AddTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    refreshTournaments: () => void;
}

const AddTournamentModal: React.FC<AddTournamentModalProps> = ({
    isOpen,
    onClose,
    refreshTournaments,
}) => {
    const { user } = useUser();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        entryPricePerTeam: "",
        rewardPrize: "",
        maxTeams: "",
        startDate: "",
        endDate: "",
        stadiumId: "",
    });

    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [stadiums, setStadiums] = useState([]);

    useEffect(() => {
        async function fetchStadiums() {
            try {
                const ownerId = user?.id;
                console.log(ownerId);
                if (!ownerId) {
                    toast.error("No owner ID found.");
                    return;
                }

                const data = await getStadiumsByOwner(ownerId);
                setStadiums(data);
                console.log("Fetched stadiums:", data);

                if (data.length === 1) {
                    setFormData((prev) => ({ ...prev, stadiumId: data[0]._id }));
                    console.log("Auto-selected stadium ID:", data[0]._id);
                } else if (data.length === 0) {
                    console.warn("No stadiums found for this owner.");
                }
            } catch (error) {
                console.error("Failed to fetch stadiums", error);
                toast.error("Failed to fetch your stadium");
            }
        }

        if (isOpen) {
            fetchStadiums();
        }
    }, [isOpen]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        try {
            setLoading(true);
            await addTournament(formData);
            toast.success("Tournament created!");
            onClose();
            refreshTournaments();
        } catch (err: any) {
            setErrors(err.response?.data?.errors || { general: "Failed to add tournament" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 max-w-xl w-full">
                <h2 className="text-xl font-semibold pb-6 dark:text-white">Add New Tournament</h2>
                {errors.general && <FieldError message={errors.general} />}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <Label>Name</Label>
                        <Input name="name" value={formData.name} onChange={handleChange} />
                        {errors.name && <FieldError message={errors.name} />}
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Input name="description" value={formData.description} onChange={handleChange} />
                        {errors.description && <FieldError message={errors.description} />}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Entry Price Per Team</Label>
                            <Input name="entryPricePerTeam" value={formData.entryPricePerTeam} onChange={handleChange} />
                            {errors.entryPricePerTeam && <FieldError message={errors.entryPricePerTeam} />}
                        </div>
                        <div>
                            <Label>Reward Prize</Label>
                            <Input name="rewardPrize" value={formData.rewardPrize} onChange={handleChange} />
                            {errors.rewardPrize && <FieldError message={errors.rewardPrize} />}
                        </div>
                    </div>
                    <div>
                        <Label>Max Teams</Label>
                        <Input name="maxTeams" value={formData.maxTeams} onChange={handleChange} />
                        {errors.maxTeams && <FieldError message={errors.maxTeams} />}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start Date</Label>
                            <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                            {errors.startDate && <FieldError message={errors.startDate} />}
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                            {errors.endDate && <FieldError message={errors.endDate} />}
                        </div>
                    </div>
                    <div>
                        <Label>Stadium</Label>
                        <select
                            name="stadiumId"
                            value={formData.stadiumId}
                            onChange={handleChange}
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="">Select a stadium</option>
                            {stadiums.map((stadium: any) => (
                                <option key={stadium._id} value={stadium._id}>
                                    {stadium.name}
                                </option>
                            ))}
                        </select>
                        {errors.stadiumId && <FieldError message={errors.stadiumId} />}
                    </div>
                    <Button type="submit" loading={loading} className="w-full">
                        Add Tournament
                    </Button>
                </form>
            </div>
        </Modal>
    );
};

export default AddTournamentModal;
