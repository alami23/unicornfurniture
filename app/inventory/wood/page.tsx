import InventoryList from '@/components/inventory/InventoryList';

export default function WoodInventoryPage() {
  return (
    <InventoryList 
      type="wood" 
      title="Wood Inventory" 
      description="Manage your wood logs and lumber stock." 
    />
  );
}
