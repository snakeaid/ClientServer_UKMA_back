"use client";

import { useState } from 'react';
import * as api from '@/lib/api';
import { Product, CreateProduct } from '@/lib/types';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <DialogHeader>
                <DialogTitle>{product ? 'Edit' : 'Create'} Product</DialogTitle>
            </DialogHeader>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input type="text" id="manufacturer" value={manufacturer} onChange={e => setManufacturer(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} />
                </div>
                <div>
                    <Label htmlFor="price">Price</Label>
                    <Input type="number" id="price" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required min="0" step="0.01" />
                </div>
                <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input type="number" id="quantity" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} required min="0" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </DialogFooter>
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
            <DialogHeader>
                <DialogTitle>{mode === 'add' ? 'Add Stock' : 'Sell Stock'} for {product.name}</DialogTitle>
            </DialogHeader>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
            <div>
                <Label htmlFor="amount">Amount</Label>
                <Input type="number" id="amount" value={amount} onChange={e => setAmount(parseInt(e.target.value))} required min="1" />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Confirm</Button>
            </DialogFooter>
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
        setStockModalOpen(false);
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
            <Button onClick={() => openProductModal()} className="mb-4">
                Add New Product
            </Button>
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map(product => (
                        <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.manufacturer}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => openStockModal(product, 'add')}>Add</Button>
                                <Button variant="ghost" size="sm" onClick={() => openStockModal(product, 'sell')}>Sell</Button>
                                <Button variant="ghost" size="sm" onClick={() => openProductModal(product)}>Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => openDeleteModal(product)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isProductModalOpen} onOpenChange={setProductModalOpen}>
                <DialogContent>
                    <ProductForm product={selectedProduct} groupId={groupId} onSave={handleSaveProduct} onCancel={() => setProductModalOpen(false)} />
                </DialogContent>
            </Dialog>

            {selectedProduct && (
                <Dialog open={isStockModalOpen} onOpenChange={setStockModalOpen}>
                    <DialogContent>
                        <StockForm product={selectedProduct} mode={stockMode} onSave={handleSaveProduct} onCancel={() => setStockModalOpen(false)} />
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the product &quot;{selectedProduct?.name}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteProduct}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 