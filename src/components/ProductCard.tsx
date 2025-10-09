import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: {
    skuId: string;
    name: string;
    category: string;
    price: number;
    inStock: boolean;
    image: string;
    ingredients: string[];
  };
  onEdit: (skuId: string) => void;
}

export default function ProductCard({ product, onEdit }: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-card hover:shadow-soft transition-smooth group">
      <div className="aspect-video overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {product.skuId}
            </p>
          </div>
          <Badge 
            variant={product.inStock ? "default" : "destructive"}
            className={product.inStock ? "bg-success text-white" : ""}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {product.ingredients.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {product.ingredients.map((ingredient) => (
                <Badge key={ingredient} variant="outline" className="text-xs">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              {product.category}
            </Badge>
            <p className="text-2xl font-bold text-primary">
              £{product.price.toFixed(2)}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => onEdit(product.skuId)}>
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
