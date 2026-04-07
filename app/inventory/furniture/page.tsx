import InventoryList from '@/components/inventory/InventoryList';

export default function FurnitureInventoryPage() {
  return (
    <InventoryList 
      type="furniture" 
      title="Furniture Inventory" 
      description="Manage your furniture stock and availability." 
    />
  );
}
