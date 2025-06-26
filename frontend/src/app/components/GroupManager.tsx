"use client";

import { useState } from "react";
import * as api from "@/lib/api";
import { ProductGroup, CreateProductGroup } from "@/lib/types";
import Link from 'next/link';

// Reusable Modal Component
function Modal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl relative w-full max-w-md">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                {children}
            </div>
        </div>
    );
}

// Group Form Component
function GroupForm({ group, onSave, onCancel }: { group?: ProductGroup, onSave: (group: ProductGroup) => void, onCancel: () => void }) {
    const [name, setName] = useState(group?.name || '');
    const [description, setDescription] = useState(group?.description || '');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const groupData: CreateProductGroup = { name, description };
        try {
            let savedGroup;
            if (group?.id) {
                await api.updateGroup(group.id, groupData);
                onSave({ ...groupData, id: group.id });
            } else {
                savedGroup = await api.createGroup(groupData);
                onSave(savedGroup);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">{group ? 'Edit' : 'Create'} Product Group</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
            </div>
        </form>
    );
}

// This is a new prop type for the main component
interface GroupManagerProps {
    onGroupCreated: (group: ProductGroup) => void;
    onGroupUpdated: (group: ProductGroup) => void;
    onGroupDeleted: (id: number) => void;
    groups: ProductGroup[];
}

export default function GroupManager({ onGroupCreated, onGroupUpdated, onGroupDeleted, groups }: GroupManagerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ProductGroup | undefined>(undefined);
    const [deletingGroup, setDeletingGroup] = useState<ProductGroup | undefined>(undefined);

    const handleSave = (savedGroup: ProductGroup) => {
        if (editingGroup) {
            onGroupUpdated(savedGroup);
        } else {
            onGroupCreated(savedGroup);
        }
        setIsModalOpen(false);
        setEditingGroup(undefined);
    };

    const handleEdit = (group: ProductGroup) => {
        setEditingGroup(group);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (deletingGroup) {
            await api.deleteGroup(deletingGroup.id);
            onGroupDeleted(deletingGroup.id);
            setDeletingGroup(undefined);
        }
    };

    return (
        <div>
            <button onClick={() => { setEditingGroup(undefined); setIsModalOpen(true); }} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Add New Group
            </button>

            {/* Edit/Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingGroup(undefined); }}>
                <GroupForm 
                    group={editingGroup} 
                    onSave={handleSave} 
                    onCancel={() => { setIsModalOpen(false); setEditingGroup(undefined); }}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deletingGroup} onClose={() => setDeletingGroup(undefined)}>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
                    <p>Are you sure you want to delete the group &quot;{deletingGroup?.name}&quot;? All products within this group will also be deleted.</p>
                    <div className="flex justify-end space-x-2 mt-6">
                        <button onClick={() => setDeletingGroup(undefined)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </div>
            </Modal>

            {/* This component will now render the list of groups and their controls */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <div key={group.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
                        <p className="text-gray-600 mb-4">{group.description}</p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => handleEdit(group)} className="text-yellow-500">Edit</button>
                            <button onClick={() => setDeletingGroup(group)} className="text-red-500">Delete</button>
                            <Link href={`/groups/${group.id}`} className="text-blue-500">View Products</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 