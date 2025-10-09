import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X } from "lucide-react";

interface Product {
  skuId: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  inStock: boolean;
  image: string;
  allergens: string[];
  shelfLife: number;
  ingredients: string[];
}

interface ProductListItemProps {
  product: Product;
  onUpdate: (skuId: string, updates: Partial<Product>) => void;
}

export default function ProductListItem({ product, onUpdate }: ProductListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);

  const handleSave = () => {
    onUpdate(product.skuId, editedProduct);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setIsEditing(false);
  };

  return (
    <Card className="shadow-card hover:shadow-soft transition-smooth">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-md"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
            <div className="md:col-span-2">
              <p className="font-semibold text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground font-mono">{product.skuId}</p>
              <Badge variant="outline" className="mt-1">
                {product.category}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Ingredients</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.ingredients.length > 0 ? (
                  product.ingredients.map((ingredient) => (
                    <Badge key={ingredient} variant="outline" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Retail Price</p>
              <p className="font-bold text-primary">£{product.price.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Cost Price</p>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={editedProduct.costPrice}
                  onChange={(e) => setEditedProduct({ ...editedProduct, costPrice: parseFloat(e.target.value) })}
                  className="h-8 w-24"
                />
              ) : (
                <p className="font-semibold">£{product.costPrice.toFixed(2)}</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Shelf Life</p>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={editedProduct.shelfLife}
                    onChange={(e) => setEditedProduct({ ...editedProduct, shelfLife: parseInt(e.target.value) })}
                    className="h-8 w-16"
                  />
                  <span className="text-sm">days</span>
                </div>
              ) : (
                <p className="font-semibold">{product.shelfLife} days</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Allergens</p>
              {isEditing ? (
                <Input
                  value={editedProduct.allergens.join(", ")}
                  onChange={(e) => setEditedProduct({ ...editedProduct, allergens: e.target.value.split(",").map(a => a.trim()) })}
                  placeholder="e.g. Gluten, Dairy"
                  className="h-8"
                />
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.allergens.length > 0 ? (
                    product.allergens.map((allergen) => (
                      <Badge key={allergen} variant="secondary" className="text-xs">
                        {allergen}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Badge 
                variant={product.inStock ? "default" : "destructive"}
                className={product.inStock ? "bg-success text-white" : ""}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
              
              {isEditing ? (
                <>
                  <Button size="sm" variant="default" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
