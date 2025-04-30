export interface Product {
    id: string;
    name: string;
    quantity: number;
    price: string;
    category: string;
}

export type ProductFormData = Omit<Product, 'id'>;
