// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Edit, Plus, Trash2 } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"



// // Define product type
// type Product = {
//     id: string
//     name: string
//     quantity: number
//     price: number
//     category: string
// }




// // Sample data
// const initialProducts: Product[] = [
//     {
//         id: "1",
//         name: "Laptop",
//         quantity: 10,
//         price: 999.99,
//         category: "Electronics",
//     },
//     {
//         id: "2",
//         name: "Office Chair",
//         quantity: 25,
//         price: 199.99,
//         category: "Furniture",
//     },
//     {
//         id: "3",
//         name: "Wireless Mouse",
//         quantity: 50,
//         price: 29.99,
//         category: "Electronics",
//     },
//     {
//         id: "4",
//         name: "Desk Lamp",
//         quantity: 15,
//         price: 49.99,
//         category: "Lighting",
//     },
//     {
//         id: "5",
//         name: "Notebook",
//         quantity: 100,
//         price: 4.99,
//         category: "Stationery",
//     },
// ]

// const categorys1 = [
//     {
//         id: "1",
//         name: 'Electronics'
//     },
// ]

// export default function InventoryPage() {
//     const [products, setProducts] = useState<Product[]>(initialProducts)
//     const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
//     const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
//     const [newCateogry, setNewCategory] = useState({
//         id: "",
//         name: ""
//     })
//     const [categories, setCategories] = useState(categorys1)
//     const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//     const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
//     const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
//         name: "",
//         quantity: 0,
//         price: 0,
//         category: "",
//     })







//  // Add new product
//     const handleAddProduct = () => {
//         const product = {
//             id: Math.random().toString(36).substring(2, 9),
//             ...newProduct,
//         }
//         setProducts([...products, product])
//         setNewProduct({ name: "", quantity: 0, price: 0, category: "" })
//         setIsAddProductDialogOpen(false)
//     }
//     const handleAddCategory = () => {
//         setCategories([...categories, newCateogry]);
//         setNewCategory({
//             id: "",
//             name: ""
//         })
//         setIsAddCategoryDialogOpen(false);
//     }

//     const handleDeleteCategory = (id: string) => {
//         const newCat = categories.filter((c) => c.id !== id)
//         setCategories(newCat);
//     }

//     // Edit product
//     const handleEditProduct = () => {
//         if (currentProduct) {
//             setProducts(products.map((product) => (product.id === currentProduct.id ? currentProduct : product)))
//             setIsEditDialogOpen(false)
//             setCurrentProduct(null)
//         }
//     }

//     // Delete product
//     const handleDeleteProduct = (id: string) => {
//         setProducts(products.filter((product) => product.id !== id))
//     }

//     // Open edit dialog
//     const openEditDialog = (product: Product) => {
//         setCurrentProduct(product)
//         setIsEditDialogOpen(true)
//     }

//     return (
//       <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
//         <div className="flex items-center justify-between">
//           <h2 className="text-3xl font-serif font-bold tracking-tight">Inventory</h2>
//           <div className="flex gap-8">
//             <Dialog
//               open={isAddProductDialogOpen}
//               onOpenChange={setIsAddProductDialogOpen}
//             >
//               <DialogTrigger asChild>
//                 <Button>
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add Product
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Add New Product</DialogTitle>
//                   <DialogDescription>
//                     Add a new product to your inventory.
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="name">Name</Label>
//                     <Input
//                       id="name"
//                       value={newProduct.name}
//                       onChange={(e) =>
//                         setNewProduct({ ...newProduct, name: e.target.value })
//                       }
//                       placeholder="Product name"
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="quantity">Quantity</Label>
//                     <Input
//                       id="quantity"
//                       type="number"
//                       value={newProduct.quantity}
//                       onChange={(e) =>
//                         setNewProduct({
//                           ...newProduct,
//                           quantity: Number.parseInt(e.target.value) || 0,
//                         })
//                       }
//                       placeholder="Quantity"
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="price">Price</Label>
//                     <Input
//                       id="price"
//                       type="number"
//                       step="0.01"
//                       value={newProduct.price}
//                       onChange={(e) =>
//                         setNewProduct({
//                           ...newProduct,
//                           price: Number.parseFloat(e.target.value) || 0,
//                         })
//                       }
//                       placeholder="Price"
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="category">Category</Label>
//                     <Select
//                       onValueChange={(value) =>
//                         setNewProduct({ ...newProduct, category: value })
//                       }
//                     >
//                       <SelectTrigger id="category">
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {categories.map((c) => (
//                           <SelectItem value={c.name}>{c.name}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button
//                     variant="outline"
//                     onClick={() => setIsAddProductDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button onClick={handleAddProduct}>Add Product</Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//             <Dialog
//               open={isAddCategoryDialogOpen}
//               onOpenChange={setIsAddCategoryDialogOpen}
//             >
//               <DialogTrigger asChild>
//                 <Button>
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add Cateogry
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Add New Category</DialogTitle>
//                   <DialogDescription>
//                     Add a new cateogry to your inventory.
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="name">Name</Label>
//                     <Input
//                       id="name"
//                       onChange={(e) =>
//                         setNewCategory({
//                           id: `${e.target.value.length}`,
//                           name: e.target.value,
//                         })
//                       }
//                       placeholder="Product name"
//                     />
//                   </div>
//                 </div>

//                 <ScrollArea className="h-72 rounded-md border">
//                   <Table className="">
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead className="pl-3 p-3">ID</TableHead>
//                         <TableHead>Name</TableHead>
//                         <TableHead>Delete</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody className="">
//                       {categories.map((c) => (
//                         <TableRow key={c.id}>
//                           <TableCell className="font-medium pl-3  p-6 text-[12px]">
//                             {c.id}
//                           </TableCell>
//                           <TableCell>
//                             <span className="border rounded-2xl text-black font-medium text-sm px-2 py-1">
//                               {c.name}
//                             </span>
//                           </TableCell>
//                           <TableCell>
//                             <Trash2
//                               onClick={() => handleDeleteCategory(c.id)}
//                               className="w-4 cursor-pointer"
//                             />
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </ScrollArea>
//                 <DialogFooter>
//                   <Button
//                     variant="outline"
//                     onClick={() => setIsAddCategoryDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button onClick={handleAddCategory}>Add Category</Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </div>

//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead className="text-right">Quantity</TableHead>
//                 <TableHead className="text-right">Price</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {products.map((product) => (
//                 <TableRow key={product.id}>
//                   <TableCell className="font-medium">{product.name}</TableCell>
//                   <TableCell>
//                     <Badge variant="outline">{product.category}</Badge>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     {product.quantity}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     ₹{product.price.toFixed(2)}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex justify-end gap-2">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => openEditDialog(product)}
//                       >
//                         <Edit className="h-4 w-4" />
//                         <span className="sr-only">Edit</span>
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleDeleteProduct(product.id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                         <span className="sr-only">Delete</span>
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>

//         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Edit Product</DialogTitle>
//               <DialogDescription>
//                 Make changes to the product details.
//               </DialogDescription>
//             </DialogHeader>
//             {currentProduct && (
//               <div className="grid gap-4 py-4">
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-name">Name</Label>
//                   <Input
//                     id="edit-name"
//                     value={currentProduct.name}
//                     onChange={(e) =>
//                       setCurrentProduct({
//                         ...currentProduct,
//                         name: e.target.value,
//                       })
//                     }
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-quantity">Quantity</Label>
//                   <Input
//                     id="edit-quantity"
//                     type="number"
//                     value={currentProduct.quantity}
//                     onChange={(e) =>
//                       setCurrentProduct({
//                         ...currentProduct,
//                         quantity: Number.parseInt(e.target.value) || 0,
//                       })
//                     }
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-price">Price</Label>
//                   <Input
//                     id="edit-price"
//                     type="number"
//                     step="0.01"
//                     value={currentProduct.price}
//                     onChange={(e) =>
//                       setCurrentProduct({
//                         ...currentProduct,
//                         price: Number.parseFloat(e.target.value) || 0,
//                       })
//                     }
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="edit-category">Category</Label>
//                   <Select
//                     defaultValue={currentProduct.category}
//                     onValueChange={(value) =>
//                       setCurrentProduct({
//                         ...currentProduct,
//                         category: value,
//                       })
//                     }
//                   >
//                     <SelectTrigger id="edit-category">
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Electronics">Electronics</SelectItem>
//                       <SelectItem value="Furniture">Furniture</SelectItem>
//                       <SelectItem value="Stationery">Stationery</SelectItem>
//                       <SelectItem value="Lighting">Lighting</SelectItem>
//                       <SelectItem value="Other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             )}
//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsEditDialogOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleEditProduct}>Save Changes</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     );
// }










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
import { Edit, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type Product = {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: { _id: string; name: string }; // Handle both cases
};

type Category = {
  _id: string;
  name: string;
};

const API_BASE_URL = "http://localhost:3000" // Adjust this based on your backend URL

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
        category: ""
    })
    const [newCategory, setNewCategory] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch initial data
    useEffect(() => {
      fetchProducts();
      fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/item`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
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
        const response = await fetch(`${API_BASE_URL}/category`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Categories fetched:", data); // Debug log
        setCategories(data);
    } catch (err) {
        setError(handleApiError(err));
    } finally {
        setLoading(false);
    }
};

    // Add new product
    const handleAddProduct = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/item`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct)
            })
            if (!response.ok) throw new Error("Failed to add product")
            const addedProduct = await response.json()



            setProducts([...products, addedProduct])
            setNewProduct({ name: "", quantity: 0, price: 0, category: "" })
            setIsAddProductDialogOpen(false)
        } catch (err) {
            setError("Failed to add product")
        }
    }

    // Add new category
    const handleAddCategory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/category`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategory })
            })
            if (!response.ok) throw new Error("Failed to add category")
            const addedCategory = await response.json()
            setCategories([...categories, addedCategory])
            setNewCategory("")
            setIsAddCategoryDialogOpen(false)
        } catch (err) {
            setError("Failed to add category")
        }
    }

    // Edit product
    const handleEditProduct = async () => {
        if (!currentProduct) return
        try {
            const response = await fetch(`${API_BASE_URL}/item/${currentProduct._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProduct)
            })
            if (!response.ok) throw new Error("Failed to update product")
            const updatedProduct = await response.json()
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
            const response = await fetch(`${API_BASE_URL}/item/${id}`, {
                method: "DELETE"
            })
            if (!response.ok) throw new Error("Failed to delete product")
            setProducts(products.filter(p => p._id !== id))
        } catch (err) {
            setError("Failed to delete product")
        }
    }

    // Delete category
    const handleDeleteCategory = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/category/${id}`, {
                method: "DELETE"
            })
            if (!response.ok) throw new Error("Failed to delete category")
            setCategories(categories.filter(c => c._id !== id))
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
            
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold tracking-tight">Inventory</h2>
                <div className="flex gap-8">
                    {/* Add Product Dialog */}
                    <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
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
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                                <DialogDescription>Add a new category to your inventory.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ScrollArea className="h-72 rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Delete</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((c) => (
                                            <TableRow key={c._id}>
                                                <TableCell>{c._id}</TableCell>
                                                <TableCell><Badge>{c.name}</Badge></TableCell>
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
                                <Button onClick={handleAddCategory}>Add Category</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Products Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {typeof product.category === 'string' 
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
                        ))}
                    </TableBody>
                </Table>
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