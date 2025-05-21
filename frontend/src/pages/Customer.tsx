
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
import { Edit, Plus, Trash2 } from "lucide-react"
import axiosInstance from "@/api";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
type Customer = {
    _id: string;
    name: string;
    gstNumber: string;
    address: string;
    panNumber: string;
};

type Category = {
    _id: string;
    name: string;
};


export default function CustoemrPage() {
    const [customer, setCustomer] = useState<Customer[]>([])
    // @ts-expect-error 
    const [categories, setCategories] = useState<Category[]>([])
    const [isAddCustomerDialogOpen, setisAddCustomerDialogOpen] = useState(false)
    // const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
    // @ts-expect-error 
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    // @ts-expect-error 
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        address: '',
        gstNumber: '',
        panNumber: '',
    })
    // @ts-expect-error
    const [newCategory, setNewCategory] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch initial data
    useEffect(() => {
        fetchCustomers();
        // fetchCategories();
    }, []);
    console.log(import.meta.env.VITE_BASE_URL)
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/customer`);

            if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
            const data = response.data;
            console.log("Products fetched:", data); // Debug log
            setCustomer(data);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    // const fetchCategories = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await fetch(`${import.meta.env.VITE_BASE_URL}/category`);
    //         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    //         const data = await response.json();
    //         console.log("Categories fetched:", data); // Debug log
    //         setCategories(data);
    //     } catch (err) {
    //         setError(handleApiError(err));
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Add new product
    const handleAddProduct = async () => {
        try {
            const response = await axiosInstance.post(`/customer`, newCustomer)
            if (response.status !== 201 ) throw new Error("Failed to add product")
            const addedProduct = response.data



            setCustomer([...customer, addedProduct])
            setNewCustomer({ name: "", gstNumber: '', address: '', panNumber: '' })
            setisAddCustomerDialogOpen(false)
            fetchCustomers()
            toast.success("Customer added successfully")
        } catch (err) {
            setError("Failed to add product")
        }
    }

    // Add new category
    // const handleAddCategory = async () => {
    //     try {
    //         const response = await fetch(`${API_BASE_URL}/category`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ name: newCategory })
    //         })
    //         if (!response.ok) throw new Error("Failed to add category")
    //         const addedCategory = await response.json()
    //         setCategories([...categories, addedCategory])
    //         setNewCategory("")
    //         setisAddCustomerDialogOpen(false)
    //     } catch (err) {
    //         setError("Failed to add category")
    //     }
    // }

    // Edit product
    // const handleEditCustomer = async () => {
    //     if (!currentCustomer) return
    //     try {
    //         const response = await fetch(`${API_BASE_URL}/customer/${currentCustomer._id}`, {
    //             method: "PUT",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(currentCustomer)
    //         })
    //         if (!response.ok) throw new Error("Failed to update product")
    //         const updatedProduct = await response.json()
    //         setCustomer(customer.map(p => p._id === updatedProduct._id ? updatedProduct : p))
    //         setIsEditDialogOpen(false)
    //         setCurrentCustomer(null)
    //     } catch (err) {
    //         setError("Failed to update product")
    //     }
    // }

    // Delete product
    const handleDeleteCustomer = async (id: string) => {
        try {
            const response = await axiosInstance.delete(`/customer/${id}`)
            if (response.status !== 200) throw new Error("Failed to delete product")
            setCustomer(customer.filter(p => p._id !== id))
            toast.success("Customer deleted successfully")
        } catch (err) {
            setError("Failed to delete product")
        }
    }

    // Delete category
    // const handleDeleteCategory = async (id: string) => {
    //     try {
    //         const response = await fetch(`${API_BASE_URL}/customer/${id}`, {
    //             method: "DELETE"
    //         })
    //         if (!response.ok) throw new Error("Failed to delete category")
    //         setCategories(categories.filter(c => c._id !== id))
    //     } catch (err) {
    //         setError("Failed to delete category")
    //     }
    // }

    // Open edit dialog
    const openEditDialog = (customer: Customer) => {
        setCurrentCustomer(customer)
        setIsEditDialogOpen(true)
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            {error && <div className="text-red-500">{error}</div>}
            {loading && <div>Loading...</div>}

            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold tracking-tight">Customers</h2>
                <div className="flex gap-8">
                    {/* Add Product Dialog */}
                    <Dialog open={isAddCustomerDialogOpen} onOpenChange={setisAddCustomerDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Customer</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Customer</DialogTitle>
                                <DialogDescription></DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={newCustomer.name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="quantity">GST Number</Label>
                                    <Input
                                        id="gst_number"
                                        type="text"
                                        maxLength={15}
                                        minLength={15}
                                        required
                                        value={newCustomer.gstNumber}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, gstNumber: e.target.value || '' })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Address</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        maxLength={100}
                                        required
                                        value={newCustomer.address}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value || '' })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Pan Number (optional)</Label>
                                    <Input
                                        id="pan_number"
                                        type="text"
                                        maxLength={10}
                                        value={newCustomer.panNumber}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, panNumber: e.target.value || '' })}
                                    />
                                </div>
                                {/* <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select onValueChange={(value) => setNewCustomer({ ...newCustomer, category: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div> */}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setisAddCustomerDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddProduct}>Add Customer</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Category Dialog */}
                    {/* <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
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
                    </Dialog> */}
                </div>
            </div>

            {/* Products Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>GST Number</TableHead>
                            <TableHead className="text-left">Address</TableHead>
                            <TableHead className="text-left">PAN Number</TableHead>
                            {/* <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customer.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>{product.name.toUpperCase()}</TableCell>
                                {/* <TableCell>
                                    <Badge variant="outline">
                                        {typeof product.category === 'string'
                                            ? product.category
                                            : product.category?.name || "Uncategorized"}
                                    </Badge>
                                </TableCell> */}
                                <TableCell className="text-left">{product.gstNumber}</TableCell>
                                <TableCell className="text-left truncate min-w-24 max-w-44">{product.address}</TableCell>
                                <TableCell className="text-left">{product.panNumber}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button> */}
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCustomer(product._id)}>
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
            {/* <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Make changes to the product details.</DialogDescription>
                    </DialogHeader>
                    {currentCustomer && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={currentCustomer.name}
                                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-quantity">Quantity</Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    value={currentCustomer.quantity}
                                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-price">Price</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    value={currentCustomer.price}
                                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Select
                                    value={typeof currentCustomer.category === 'string' ? currentCustomer.category : currentCustomer.category._id}
                                    onValueChange={(value) => setCurrentCustomer({ ...currentCustomer, category: value })}
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
                        <Button onClick={handleEditCustomer}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </div>
    )
}