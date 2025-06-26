"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import * as api from '@/lib/api';
import { Product, ProductGroup } from '@/lib/types';
import ProductManager from '../../components/ProductManager';

export default function GroupDetailPage() {
    const params = useParams();
    const groupId = parseInt(params.groupId as string, 10);
    
    const [group, setGroup] = useState<ProductGroup | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [groupValue, setGroupValue] = useState<number | null>(null);

    useEffect(() => {
        if (!groupId) return;

        async function loadData() {
            try {
                setLoading(true);
                const [groupData, productsData, groupValueData] = await Promise.all([
                    api.getGroupById(groupId),
                    api.getProducts(groupId),
                    api.getGroupTotalValue(groupId),
                ]);

                setGroup(groupData);
                setProducts(productsData);
                setGroupValue(groupValueData.totalValue);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [groupId]);

    const handleProductsChange = (newProducts: Product[]) => {
        setProducts(newProducts);
        // Recalculate group value
        const newTotal = newProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
        setGroupValue(newTotal);
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <Link href="/" className="text-blue-500 hover:underline">&larr; Back to Groups</Link>
                    <h1 className="text-4xl font-bold">{group ? group.name : 'Products'}</h1>
                </div>
                {groupValue !== null && (
                    <div className="text-lg">
                        <strong>Total Value for this Group:</strong> ${groupValue.toFixed(2)}
                    </div>
                )}
            </header>

            <ProductManager 
                products={products} 
                groupId={groupId}
                onProductsChange={handleProductsChange}
            />
        </div>
    );
} 