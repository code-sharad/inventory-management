import { DatePicker } from "@/components/date-range";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUpIcon } from "lucide-react";
import { Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import InvoiceClassic from "@/components/invoice-templates/template-classic";
import ModernInvoiceTemplate from "@/components/invoice-templates/template-Modern";
import PremiumMinimalInvoice from "@/components/invoice-templates/template-minimal";
import TemplateCarousel from "@/components/invoice-templates/TemplateCarousel";
import axiosInstance from "@/api";
import { toast } from "sonner";




function Invoice() {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
    hsnCode: string;
  }>({
    id: "",
    name: "",
    quantity: 0,
    price: 0,
    category: "",
    hsnCode: "",
  });
  const [gstRate, setGstRate] = useState(0.18);
  const [inventoryItems, setInventoryItems] = useState<
    {
      id: string;
      name: string;
      quantity: number;
      price: number;
      category: string;
      hsnCode: string;
      categoryId: string;
    }[]
  >([]);
  const [invoiceItems, setInvoiceItems] = useState<
    {
      id: string;
      name: string;
      quantity: number;
      price: number;
      category: string;
      hsnCode: string;
    }[]
  >([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [companyDetails, setCompanyDetails] = useState({
    name: "Your Company Name",
    address: "123 Business Street",
    cityState: "City, State 12345",
    phone: "(555) 123-4567",
    email: "billing@company.com",
  });
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  const [customers, setCustomers] = useState<{
    id: string;
    name: string;
    gstNumber: string;
    panNumber: string;
    address: string;
  }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    name: string;
    gstNumber: string;
    panNumber: string;
    address: string;
  }>({
    id: "",
    name: "",
    gstNumber: "",
    panNumber: "",
    address: "",
  });
  const [quantity, setQuantity] = useState(0);

  const [includeTransportation, setIncludeTransportation] = useState(false);
  const [transportationValue, setTransportationValue] = useState(0);
  const [includePackaging, setIncludePackaging] = useState(false);
  const [packagingValue, setPackagingValue] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosInstance.get(`/item`, { withCredentials: true });
        const items = response.data.map((item: any) => {
          let categoryName = "Uncategorized";
          let categoryId = "";
          if (item.category && typeof item.category === 'object' && item.category.name) {
            categoryName = item.category.name;
            categoryId = item.category._id?.toString() || "";
            console.log(`Mapped item ${item.name} with category: ${categoryName}`);
          } else if (item.category) {
            console.error(`Category object for ${item.name} missing name, raw data:`, item.category);
            categoryName = item.category.toString();
            categoryId = item.category.toString();
          } else {
            console.error(`No category data for item: ${item.name}`);
          }
          return {
            id: item._id?.toString() || "",
            name: item.name || "Unknown Product",
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            category: categoryName,
            categoryId: categoryId,
            hsnCode: item.hsnCode || "",
          };
        });
        console.log("Mapped inventory items:", JSON.stringify(items, null, 2));
        setInventoryItems(items);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get(`/customer`, { withCredentials: true });
        console.log("Raw /api/customers response:", JSON.stringify(response.data, null, 2));
        const customers = response.data.map((customer: any) => ({
          id: customer._id?.toString() || "",
          name: customer.name || "Unknown Customer",
          gstNumber: customer.gstNumber || "Unknown GST Number",
          panNumber: customer.panNumber || "Unknown Pan Number",
          address: customer.address || "Unknown Address",
        }));
        setCustomers(customers);
        console.log("Mapped customers:", JSON.stringify(customers, null, 2));
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    }
    fetchCustomers();
    fetchItems();
  }, []);

  const templates = [
    {
      id: "modern",
      name: "Modern Template",
      preview: "/templates/modern.png",
      component: ModernInvoiceTemplate,
    },
    {
      id: "classic",
      name: "Classic Template",
      preview: "/templates/classic.png",
      component: InvoiceClassic,
    },
    {
      id: "minimal",
      name: "Minimal Template",
      preview: "/templates/minimal.png",
      component: PremiumMinimalInvoice,
    },
  ];

  const SelectedTemplate =
    templates.find((t) => t.id === selectedTemplate)?.component ||
    ModernInvoiceTemplate;

  const handleAddProduct = () => {
    if (
      !selectedProduct.id ||
      !selectedProduct.name ||
      !Number.isFinite(selectedProduct.quantity) ||
      selectedProduct.quantity < 1 ||
      !Number.isFinite(selectedProduct.price) ||
      selectedProduct.price <= 0 ||
      !selectedProduct.category
    ) {
      toast.error(
        "Please select a valid product with quantity >= 1, price > 0, and a valid category."
      );
      return;
    }

    const inventoryItem = inventoryItems.find((inv) => inv.id === selectedProduct.id);
    if (!inventoryItem) {
      console.error("No matching inventory item found for:", selectedProduct);
      toast.error("Error: Invalid product. Please try again.");
      return;
    }
    if (!inventoryItem.category || inventoryItem.category === "Uncategorized") {
      console.warn("Category for selected product is invalid:", inventoryItem);
    }
    const category = inventoryItem.category;

    const newProduct = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      quantity: Math.floor(Number(selectedProduct.quantity)),
      price: Number(selectedProduct.price),
      category,
      hsnCode: selectedProduct.hsnCode,
    };

    console.log("Adding product:", JSON.stringify(newProduct, null, 2));
    console.log("Current invoiceItems:", JSON.stringify(invoiceItems, null, 2));

    const existingProductIndex = invoiceItems.findIndex(
      (item) => item.id === newProduct.id
    );

    if (existingProductIndex !== -1) {
      setInvoiceItems((prevItems) =>
        prevItems.map((item, index) =>
          index === existingProductIndex
            ? { ...item, quantity: item.quantity + newProduct.quantity, hsnCode: newProduct.hsnCode }
            : item
        )
      );
    } else {
      setInvoiceItems((prevItems) => [...prevItems, newProduct]);
    }

    setSelectedProduct({
      id: "",
      name: "",
      quantity: 0,
      price: 0,
      category: "",
      hsnCode: "",
    });

    setOpen(false);

    console.log("Updated invoiceItems:", JSON.stringify(invoiceItems, null, 2));
  };

  const handleProductDelete = (id: string) => {
    console.log("Deleting product with id:", id);
    const newProducts = invoiceItems.filter((product) => product.id !== id);
    setInvoiceItems(newProducts);
  };

  const handleSaveInvoice = async () => {
    if (!customers || !invoiceNumber || invoiceItems.length === 0) {
      toast.error("Please provide customer name, email, address, invoice number, and at least one item.");
      return;
    }

    if (invoiceItems.some(item => !item.category || item.category === "Uncategorized")) {
      toast.error("All items must have a valid category (not 'Uncategorized').");
      return;
    }

    try {
      console.log("Saving invoice with data:", JSON.stringify(invoiceData, null, 2));
      const response = await axiosInstance.post(`/invoice`, invoiceData, { withCredentials: true });
      console.log("Invoice saved successfully:", response.data);
      toast.success('Invoice saved successfully!');
    } catch (error: any) {
      console.error('Error saving invoice:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      const errorMessage = error.response?.data?.message || error.message || 'Unknown server error';
      toast.error(`Failed to save invoice: ${errorMessage}`);
    }
  };

  // Calculate invoice summary for preview and template
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    + transportationValue
    + packagingValue;
  const gstAmount = subtotal * gstRate;
  const total = subtotal + gstAmount;

  const invoiceData = {
    gstRate,
    customer: selectedCustomer,
    invoiceNumber,
    invoiceDate,
    items: invoiceItems,
    companyDetails,
    subtotal,
    gstAmount,
    total,
    transportationAndOthers: transportationValue,
    packaging: packagingValue,
  };

  return (
    <div className="container p-4 pt-6 md:p-8">
      <h1 className="text-3xl mb-8 font-serif font-bold tracking-tight">Create Invoice</h1>
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 min-w-0">
        <Card className="flex-1 min-w-0 w-full lg:w-1/2">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Invoice Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Company Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="my-2">Company Name</Label>
                    <Input
                      className="w-full"
                      value={companyDetails.name}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="my-2">Address</Label>
                    <Input
                      className="w-full"
                      value={companyDetails.address}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="my-2">City, State ZIP</Label>
                    <Input
                      className="w-full"
                      value={companyDetails.cityState}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          cityState: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="my-2">Phone</Label>
                    <Input
                      className="w-full"
                      value={companyDetails.phone}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="my-2">Email</Label>
                    <Input
                      className="w-full"
                      value={companyDetails.email}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
                <div className="space-y-4">
                  <div>
                    <Popover>
                      <PopoverTrigger className="w-full border p-2 rounded-md text-left pl-4 font-medium flex justify-between items-center">
                        {selectedCustomer.name !== "" ? selectedCustomer.name : "Select customer..."} {" "}
                        <div className="inline-flex h-6 flex-col">
                          <ChevronUpIcon /> <ChevronDown />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-[90vw] max-w-[300px]">
                        <Command>
                          <CommandInput placeholder="Search customer..." />
                          <CommandList>
                            <CommandEmpty>No customers found.</CommandEmpty>
                            <CommandGroup heading="Customers">
                              <ScrollArea className="h-[200px]">
                                {customers.map((c) => (
                                  <CommandItem
                                    key={c.id}
                                    value={c.name}
                                    onSelect={() => {
                                      setSelectedCustomer({
                                        id: c.id,
                                        name: c.name,
                                        gstNumber: c.gstNumber,
                                        panNumber: c.panNumber,
                                        address: c.address
                                      });
                                    }}
                                  >
                                    <div className="flex flex-col gap-1">
                                      <span className="font-medium">{c.name}</span>
                                      {/* <span className="text-sm text-muted-foreground">{c.email}</span> */}
                                      <span className="text-sm text-muted-foreground">{c.address}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedCustomer.id && (
                    <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Name:</span>
                        <span>{selectedCustomer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">GST:</span>
                        <span>{selectedCustomer.gstNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Pan Number:</span>
                        <span>{selectedCustomer.panNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Address:</span>
                        <span>{selectedCustomer.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex flex-col gap-4">Invoice Details</h3>
                <div className="flex flex-col sm:flex-row gap-4 ">
                  <div className="min-w-0 flex-1">
                    <Label className="mb-2"># Invoice Number</Label>
                    <Input
                      className="w-full"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                  <div className="min-w-0 flex-1 mb-4">
                    <Label className="mb-2">GST Rate</Label>
                    <Input
                      className="w-full"
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                      type="number"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex flex-col flex-1 gap-2">
                    <Label className="mb-0">Transportation & Others</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">₹</span>
                      <Input
                        className="w-full ml-0"
                        value={transportationValue}
                        onChange={(e) => setTransportationValue(Number(e.target.value) || 0)}
                        type="number"
                        min="0"
                        placeholder="Enter amount"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Enter extra transportation or miscellaneous charges</span>
                  </div>
                  <div className="flex flex-col flex-1 gap-2">
                    <Label className="mb-0">Packaging</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">₹</span>
                      <Input
                        className="w-full ml-0"
                        value={packagingValue}
                        onChange={(e) => setPackagingValue(Number(e.target.value) || 0)}
                        type="number"
                        min="0"
                        placeholder="Enter amount"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Enter packaging charges</span>
                  </div>
                </div>
                <div className="w-full">
                  <Label className="mb-2">Invoice Date</Label>
                  <DatePicker value={invoiceDate} onChange={setInvoiceDate} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-2 min-w-0 w-full lg:w-1/2">
          <CardHeader className="flex flex-col sm:flex-row gap-2 justify-between">
            <CardTitle className="text-2xl font-semibold">
              Product Details
            </CardTitle>
            <Button onClick={handleAddProduct} className="w-full sm:w-32 py-4">
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <div>
              <div className="flex flex-col justify-start items-center sm:flex-row gap-4 flex-wrap min-w-0">
                <div className="w-full sm:w-auto min-w-0">
                  <h2 className="font-medium mb-2">Product</h2>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger className="w-full sm:w-56 border p-2 rounded-md text-left pl-4 font-medium flex justify-between items-center">
                      {selectedProduct.name !== ""
                        ? selectedProduct.name
                        : "select product..."} {" "}
                      <div className="inline-flex h-6 flex-col">
                        <ChevronUpIcon /> <ChevronDown />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[90vw] max-w-[300px] sm:w-auto">
                      <Command>
                        <CommandInput placeholder="search product..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup heading="Suggestions">
                            <ScrollArea className="h-[200px]">
                              {inventoryItems?.map((product) => {
                                return (
                                  <CommandItem
                                    id={product.id}
                                    value={product.name}
                                    key={product.id}
                                    onSelect={() => {
                                      console.log("Selected product:", JSON.stringify(product, null, 2));
                                      setQuantity(product.quantity);
                                      setSelectedProduct({
                                        id: product.id,
                                        name: product.name,
                                        quantity: product.quantity,
                                        price: product.price,
                                        category: product.category,
                                        hsnCode: product.hsnCode,
                                      });
                                      console.log(product)
                                      setOpen(false);
                                    }}
                                  >
                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition">
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-base">{product.name}</span>
                                        <div className="flex items-center gap-2 mr-2 mt-1">
                                          <Badge className="bg-gray-200 dark:bg-zinc-700 dark:text-white text-gray-700 border-none px-2 py-1 text-xs">
                                            {product.category}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground ">Stock: {product.quantity}</span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end">
                                        <span className="font-bold text-lg text-primary">₹{product.price}</span>
                                        <span className="text-xs text-muted-foreground">per unit</span>
                                      </div>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </ScrollArea>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-full sm:w-auto min-w-0">
                  <h2 className="font-semibold mb-2">Quantity</h2>
                  <div className="flex border rounded-md w-full max-w-xs">
                    <Button
                      variant="secondary"
                      className="max-w-8 rounded-r-none rounded-l-md "
                      onClick={() =>
                        setSelectedProduct({
                          ...selectedProduct,
                          quantity: Math.max(0, selectedProduct.quantity - 1),
                        })
                      }
                    >
                      -
                    </Button>
                    <input
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value) || 0, quantity);
                        setSelectedProduct({
                          ...selectedProduct,
                          quantity: val,
                        })
                      }
                      }
                      value={Math.max(0, selectedProduct.quantity)}
                      className="w-24 text-center rounded-none border-r border-l border-b-0 border-t-0"
                      type="number"
                      min="0"
                    />
                    <Button
                      variant="secondary"
                      className="rounded-l-none rounded-r-md "
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        setSelectedProduct({
                          ...selectedProduct,
                          quantity: Math.min(quantity, selectedProduct.quantity + 1),
                        })
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="w-full sm:w-auto min-w-0">
                  <Label className="text-[17px] mb-2">Price</Label>
                  <Input
                    className="w-fit h-9"
                    value={selectedProduct.price || 0}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        price: Number(e.target.value) || 0,
                      })
                    }
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              <ScrollArea className="overflow-x-auto max-h-[800px] mt-4 w-full">
                <div className="w-full min-w-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6 p-6">Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Item Price</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium pl-6 p-6 text-[16px]">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <span className="border dark:border-gray-700 dark:text-white rounded-2xl text-black text-sm px-2 py-1">
                              {product.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-[16px]">
                            {product.quantity}
                          </TableCell>
                          <TableCell className="text-start text-[16px]">
                            ₹{product.price * product.quantity}
                          </TableCell>
                          <TableCell className="text-start text-[16px]">
                            ₹{product.price}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <button
                              onClick={() => handleProductDelete(product.id)}
                              className="hover:rounded-md hover:bg-red-100 px-4 py-2"
                              title="Delete item"
                            >
                              <Trash2 width={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 w-full">
        <CardContent>
          <TemplateCarousel
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            invoiceData={invoiceData}
          />
        </CardContent>
      </Card>

      <div className="container mt-8 w-full overflow-x-auto">
        {/* @ts-ignore */}
        <SelectedTemplate invoiceData={invoiceData} />
      </div>

      <div className="container mt-12 w-full flex justify-center">
        <Button
          onClick={handleSaveInvoice}
          className="w-full max-w-md h-16  p-5 px-12 text-lg font-bold bg-neutral-900 text-white shadow-lg rounded-xl hover:scale-[1.02] hover:bg-neutral-800 transition-all duration-200 focus:ring-4 cursor-pointer focus:outline-none"
        >
          Save Invoice
        </Button>
      </div>
    </div>
  );
}

export default Invoice;