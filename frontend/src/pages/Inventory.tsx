"use client"

const handleApiError = (err: unknown) => {
    console.error("API Error:", err);
    return err instanceof Error ? err.message : "An unknown error occurred";
};

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, FolderPlus, PackagePlus, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import axiosInstance from "@/api";
import { toast } from "sonner";

type Product = {
    _id: string;
    name: string;
    quantity: number;
    price: number;
    hsnCode: string;
    category: { _id: string; name: string }; // Handle both cases
};

type Category = {
    _id: string;
    name: string;
};

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
    const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
    const [newProduct, setNewProduct] = useState({
        name: "",
        quantity: 0,
        price: 0,
        hsnCode: "",
        category: ""
    })
    const [newCategory, setNewCategory] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    // Fetch initial data
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/item`);

            if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
            const data = response.data;
            console.log("Products fetched:", data); // Debug log
            setProducts(data);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/category`);
            if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
            const data = response.data;
            console.log("Categories fetched:", data); // Debug log
            setCategories(data);

        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    // Calculate paginated products
    const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    // Reset to first page if products change and current page is out of range
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [products, totalPages]);

    // Add new product
    const handleAddProduct = async () => {
        try {
            const response = await axiosInstance.post(`/item`, newProduct)
            if (response.status !== 200) throw new Error("Failed to add product")


            fetchProducts();
            fetchCategories();

            setNewProduct({ name: "", quantity: 0, price: 0, hsnCode: "", category: "" })
            setIsAddProductDialogOpen(false)
            toast.success("Product added successfully")
        } catch (err) {
            console.log("firstError")
            setError("Failed to add product")
        }
    }

    // Add new category
    const handleAddCategory = async () => {
        try {
            const response = await axiosInstance.post(`/category`, { name: newCategory })
            if (response.status !== 201) throw new Error("Failed to add category")
            const addedCategory = response.data
            setCategories([...categories, addedCategory])
            fetchProducts();
            fetchCategories();
            setNewCategory("")
            // setIsAddCategoryDialogOpen(false)
            toast.success("Category added successfully")
        } catch (err) {
            setError("Failed to add category")
        }
    }

    // Edit product
    const handleEditProduct = async () => {
        if (!currentProduct) return
        try {
            const response = await axiosInstance.put(`/item/${currentProduct._id}`, currentProduct)
            if (response.status !== 200) throw new Error("Failed to update product")
            const updatedProduct = response.data
            setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p))
            setIsEditDialogOpen(false)
            setCurrentProduct(null)
        } catch (err) {
            setError("Failed to update product")
        }
    }

    // Delete product
    const handleDeleteProduct = async (id: string) => {
        try {
            const response = await axiosInstance.delete(`/item/${id}`)
            if (response.status !== 200) throw new Error("Failed to delete product")
            setProducts(products.filter(p => p._id !== id))
            toast.success("Product deleted successfully")
        } catch (err) {
            setError("Failed to delete product")
        }
    }

    // Delete category
    const handleDeleteCategory = async (id: string) => {
        try {
            const response = await axiosInstance.delete(`/category/${id}`)
            if (response.status !== 200) throw new Error("Failed to delete category")
            setCategories(categories.filter(c => c._id !== id))
            toast.success("Category deleted successfully")
        } catch (err) {
            setError("Failed to delete category")
        }
    }

    // Open edit dialog
    const openEditDialog = (product: Product) => {
        setCurrentProduct(product)
        setIsEditDialogOpen(true)
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            {error && <div className="text-red-500">{error}</div>}
            {loading && <div>Loading...</div>}

            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-3xl font-serif font-bold tracking-tight">Inventory</h2>
                <div className="flex gap-8 flex-wrap">
                    {/* Add Product Dialog */}
                    <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><PackagePlus className="md:mr-2 h-4 w-4" /> <span className="hidden md:block ">Add Product</span></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                                <DialogDescription>Add a new product to your inventory.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="hsnCode">HSN Code</Label>
                                    <Input
                                        id="hsnCode"
                                        value={newProduct.hsnCode}
                                        onChange={(e) => setNewProduct({ ...newProduct, hsnCode: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={newProduct.quantity}
                                        onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddProduct}>Add Product</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Category Dialog */}
                    <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><FolderPlus className="md:mr-2 h-4 w-4 " /> <span className="hidden md:block">Add Category</span></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                                <DialogDescription>Add a new category to your inventory.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2 ">
                                    <Label htmlFor="name">Name</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="name"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                        />
                                        <Button onClick={handleAddCategory}>Add Category</Button>
                                    </div>
                                </div>
                            </div>
                            <ScrollArea className="h-72 rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="">Sr.No</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Delete</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((c) => (
                                            <TableRow key={c._id}>
                                                <TableCell className="">{categories.indexOf(c) + 1}</TableCell>
                                                {/* <TableCell className="hidden md:block">{c._id}</TableCell> */}
                                                <TableCell>{c.name}</TableCell>
                                                <TableCell>
                                                    <Trash2
                                                        onClick={() => handleDeleteCategory(c._id)}
                                                        className="w-4 cursor-pointer"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>Cancel</Button>

                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Search products..."
                            className="w-64"
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                const filtered = products.filter((product) =>
                                    product.name.includes(e.target.value) 
                                );
                                console.log(filtered);
                                setFilteredProducts(filtered);
                            }}
                        />
                       
                    </div>
                </div>

            </div>

            {/* Products Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>HSN Code</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? paginatedProducts.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.hsnCode}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {typeof product.category === 'string'
                                            // @ts-ignore
                                            ? product.category?.name
                                            : product.category?.name || "Uncategorized"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{product.quantity}</TableCell>
                                <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : filteredProducts.map((product) => {
                            return <TableRow key={product._id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.hsnCode}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {typeof product.category === 'string'
                                            // @ts-ignore
                                            ? product.category?.name
                                            : product.category?.name || "Uncategorized"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{product.quantity}</TableCell>
                                <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        }
                        )}
                    </TableBody>
                </Table>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center p-4">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        Previous
                    </Button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Edit Product Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Make changes to the product details.</DialogDescription>
                    </DialogHeader>
                    {currentProduct && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={currentProduct.name}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-quantity">Quantity</Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    value={currentProduct.quantity}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-price">Price</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    value={currentProduct.price}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Select
                                    value={typeof currentProduct.category === 'string' ? currentProduct.category : currentProduct.category._id}
                                    // @ts-ignore
                                    onValueChange={(value) => setCurrentProduct({ ...currentProduct, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditProduct}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}