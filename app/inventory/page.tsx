import InventoryList from '@/components/inventory/InventoryList';

export default function InventoryPage() {
  return (
    <InventoryList 
      type="all" 
      title="Inventory Management" 
      description="Manage your furniture and wood stock." 
    />
  );
}
