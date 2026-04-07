import CategoryList from '@/components/categories/CategoryList';

export default function CategoriesPage() {
  return (
    <CategoryList 
      type="all" 
      title="Product Categories" 
      description="Manage categories for both Furniture and Wood products." 
    />
  );
}
