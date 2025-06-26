"use client";

import { useState } from "react";
import Link from 'next/link';
import * as api from "@/lib/api";
import { ProductGroup, CreateProductGroup } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GroupForm({ group, onSave, onCancel }: { group?: ProductGroup, onSave: (group: ProductGroup) => void, onCancel: () => void }) {
    const [name, setName] = useState(group?.name || '');
    const [description, setDescription] = useState(group?.description || '');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const groupData: CreateProductGroup = { name, description };
        try {
            if (group?.id) {
                await api.updateGroup(group.id, groupData);
                onSave({ ...groupData, id: group.id });
            } else {
                const newGroup = await api.createGroup(groupData);
                onSave(newGroup);
            }
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("An unknown error occurred");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{group ? 'Edit' : 'Create'} Product Group</DialogTitle>
                <DialogDescription>
                    {group ? 'Update the details of your product group.' : 'Create a new group to organize your products.'}
                </DialogDescription>
            </DialogHeader>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" required />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </DialogFooter>
        </form>
    );
}

interface GroupManagerProps {
    onGroupCreated: (group: ProductGroup) => void;
    onGroupUpdated: (group: ProductGroup) => void;
    onGroupDeleted: (id: number) => void;
    groups: ProductGroup[];
}

export default function GroupManager({ onGroupCreated, onGroupUpdated, onGroupDeleted, groups }: GroupManagerProps) {
    const [isCreateEditModalOpen, setCreateEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    
    const [selectedGroup, setSelectedGroup] = useState<ProductGroup | undefined>(undefined);

    const handleSave = (savedGroup: ProductGroup) => {
        if (selectedGroup) {
            onGroupUpdated(savedGroup);
        } else {
            onGroupCreated(savedGroup);
        }
        setCreateEditModalOpen(false);
    };
    
    const handleDelete = async () => {
        if (selectedGroup) {
            await api.deleteGroup(selectedGroup.id);
            onGroupDeleted(selectedGroup.id);
            setDeleteModalOpen(false);
        }
    };

    const openCreateModal = () => {
        setSelectedGroup(undefined);
        setCreateEditModalOpen(true);
    };

    const openEditModal = (group: ProductGroup) => {
        setSelectedGroup(group);
        setCreateEditModalOpen(true);
    };
    
    const openDeleteModal = (group: ProductGroup) => {
        setSelectedGroup(group);
        setDeleteModalOpen(true);
    };

    return (
        <div>
            <Button onClick={openCreateModal} className="mb-4">Add New Group</Button>

            <Dialog open={isCreateEditModalOpen} onOpenChange={setCreateEditModalOpen}>
                <DialogContent>
                    <GroupForm group={selectedGroup} onSave={handleSave} onCancel={() => setCreateEditModalOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the group &quot;{selectedGroup?.name}&quot;? All products within this group will also be deleted. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <Card key={group.id}>
                        <CardHeader>
                            <CardTitle>{group.name}</CardTitle>
                            <CardDescription>{group.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => openEditModal(group)}>Edit</Button>
                            <Button variant="destructive" onClick={() => openDeleteModal(group)}>Delete</Button>
                            <Button asChild>
                                <Link href={`/groups/${group.id}`}>View Products</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
} 