"use client";

import { useState } from 'react';
import * as api from '@/lib/api';
import { Product, CreateProduct } from '@/lib/types';

// Reusable Modal Component (assuming it's defined elsewhere or defined here)
function Modal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl relative w-full max-w-lg">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                {children}
            </div>
        </div>
    );
}

// Product Form
function ProductForm({ product, groupId, onSave, onCancel }: { product?: Product, groupId: number, onSave: (product: Product) => void, onCancel: () => void }) {
    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [manufacturer, setManufacturer] = useState(product?.manufacturer || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [quantity, setQuantity] = useState(product?.quantity || 0);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const productData: CreateProduct = { name, description, manufacturer, price, quantity, groupId };
        try {
            if (product?.id) {
                await api.updateProduct(product.id, productData);
                onSave({ ...productData, id: product.id });
            } else {
                const newProduct = await api.createProduct(productData);
                onSave(newProduct);
            }
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("An unknown error occurred");
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">{product ? 'Edit' : 'Create'} Product</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full input" />
                </div>
                <div>
                    <label htmlFor="manufacturer" className="block text-sm font-medium">Manufacturer</label>
                    <input type="text" id="manufacturer" value={manufacturer} onChange={e => setManufacturer(e.target.value)} required className="mt-1 block w-full input" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium">Description</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full input" />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium">Price</label>
                    <input type="number" id="price" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required min="0" step="0.01" className="mt-1 block w-full input" />
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium">Quantity</label>
                    <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} required min="0" className="mt-1 block w-full input" />
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
            </div>
        </form>
    );
}


// Stock Management Form
function StockForm({ product, onSave, onCancel, mode }: { product: Product, onSave: (product: Product) => void, onCancel: () => void, mode: 'add' | 'sell' }) {
    const [amount, setAmount] = useState(1);
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (mode === 'add') {
                await api.addStock(product.id, amount);
            } else {
                if (amount > product.quantity) {
                    setError("Cannot sell more than available stock.");
                    return;
                }
                await api.sellStock(product.id, amount);
            }
            const updatedProduct = { ...product, quantity: product.quantity + (mode === 'add' ? amount : -amount) };
            onSave(updatedProduct);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("An unknown error occurred");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <h2 className="text-2xl font-bold">{mode === 'add' ? 'Add Stock' : 'Sell Stock'} for {product.name}</h2>
             {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
             <div>
                 <label htmlFor="amount" className="block text-sm font-medium">Amount</label>
                 <input type="number" id="amount" value={amount} onChange={e => setAmount(parseInt(e.target.value))} required min="1" className="mt-1 block w-full input" />
             </div>
             <div className="flex justify-end space-x-2">
                 <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                 <button type="submit" className="btn-primary">Confirm</button>
             </div>
        </form>
    );
}

// Main Component
interface ProductManagerProps {
    products: Product[];
    groupId: number;
    onProductsChange: (products: Product[]) => void;
}

export default function ProductManager({ products, groupId, onProductsChange }: ProductManagerProps) {
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [isStockModalOpen, setStockModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [stockMode, setStockMode] = useState<'add' | 'sell'>('add');

    const handleSaveProduct = (product: Product) => {
        const newProducts = selectedProduct
            ? products.map(p => p.id === product.id ? product : p)
            : [...products, product];
        onProductsChange(newProducts);
        setProductModalOpen(false);
    };

    const handleDeleteProduct = async () => {
        if (selectedProduct) {
            await api.deleteProduct(selectedProduct.id);
            onProductsChange(products.filter(p => p.id !== selectedProduct.id));
            setDeleteModalOpen(false);
        }
    };
    
    const openProductModal = (product?: Product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    };

    const openStockModal = (product: Product, mode: 'add' | 'sell') => {
        setSelectedProduct(product);
        setStockMode(mode);
        setStockModalOpen(true);
    };

    const openDeleteModal = (product: Product) => {
        setSelectedProduct(product);
        setDeleteModalOpen(true);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <button onClick={() => openProductModal()} className="mb-4 btn-primary">
                Add New Product
            </button>

            <table className="w-full text-left table-auto">
                {/* table head */}
                <tbody>
                    {products.map(product => (
                        <tr key={product.id} className="border-b">
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">{product.manufacturer}</td>
                            <td className="p-2">{product.quantity}</td>
                            <td className="p-2">${product.price.toFixed(2)}</td>
                            <td className="p-2 space-x-2">
                                <button onClick={() => openStockModal(product, 'add')} className="text-green-500">Add</button>
                                <button onClick={() => openStockModal(product, 'sell')} className="text-blue-500">Sell</button>
                                <button onClick={() => openProductModal(product)} className="text-yellow-500">Edit</button>
                                <button onClick={() => openDeleteModal(product)} className="text-red-500">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)}>
                <ProductForm product={selectedProduct} groupId={groupId} onSave={handleSaveProduct} onCancel={() => setProductModalOpen(false)} />
            </Modal>

            {selectedProduct && (
                <Modal isOpen={isStockModalOpen} onClose={() => setStockModalOpen(false)}>
                    <StockForm product={selectedProduct} mode={stockMode} onSave={handleSaveProduct} onCancel={() => setStockModalOpen(false)} />
                </Modal>
            )}

            <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
                    <p>Are you sure you want to delete the product &quot;{selectedProduct?.name}&quot;?</p>
                    <div className="flex justify-end space-x-2 mt-6">
                        <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button onClick={handleDeleteProduct} className="btn-danger">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 