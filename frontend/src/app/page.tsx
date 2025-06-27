"use client";

import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { ProductGroup } from "@/lib/types";
import GroupManager from "./components/GroupManager";
import SearchBar from "./components/SearchBar";

export default function HomePage() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [totalValue, setTotalValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [groupsData, totalValueData] = await Promise.all([
          api.getGroups(),
          api.getTotalValue(),
        ]);
        setGroups(groupsData);
        if(totalValueData) {
          setTotalValue(totalValueData.totalValue);
        }
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
  }, []);

  const handleGroupCreated = (newGroup: ProductGroup) => {
    setGroups([...groups, newGroup]);
    // Optionally, we can recalculate total value or just wait for next full load
  };
  
  const handleGroupUpdated = (updatedGroup: ProductGroup) => {
    setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const handleGroupDeleted = (groupId: number) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };


  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Inventory</h1>
        {totalValue !== null && (
          <div className="text-lg">
            <strong>Total Inventory Value:</strong> ${totalValue.toFixed(2)}
          </div>
        )}
      </header>

      <div className="flex justify-center">
        <SearchBar />
      </div>

      <GroupManager 
        groups={groups}
        onGroupCreated={handleGroupCreated}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={handleGroupDeleted}
      />
    </div>
  );
}
