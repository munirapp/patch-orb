"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Loader,
} from "lucide-react";
import Link from "next/link";
import {
  useGetMenusQuery,
  useDeleteMenuMutation,
} from "@/lib/features/menus/menuApi";
import qs from "querystring";
import { useRouter } from "next/navigation";
import { DeleteMenuConfirmationModal } from "@/components/delete-menu-confirmation-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { wait } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function MenusPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: dataMenus } = useGetMenusQuery(
    qs.stringify({ page: currentPage, limit: ITEMS_PER_PAGE, name: searchTerm })
  );
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: number;
    itemName: string;
  }>({
    isOpen: false,
    itemId: 0,
    itemName: "",
  });
  const [deleteStatus, setDeleteStatus] = useState<
    "success" | "error" | "loading" | null
  >(null);
  const [deleteStatusMessage, setDeleteStatusMessage] = useState("");
  const [deleteMenu] = useDeleteMenuMutation();

  // Calculate pagination
  const totalPages = dataMenus?.pagination?.totalPages || 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (id: number) => {
    // Navigate to the edit page with the item ID
    router.push(`/menus/edit/${id}`);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, itemId: id, itemName: name });
  };

  const handleDeleteConfirm = (id: number, menuName: string) => {
    setDeleteStatus("loading");
    setDeleteStatusMessage("delete data, please wait...");

    deleteMenu(id)
      .then(async (res) => {
        if (res?.error) {
          setDeleteStatus("error");
          setDeleteStatusMessage(
            `cannot delete ${menuName}, please try again later or ensure this menu item is not listed in any transactions.`
          );
          return;
        }

        setDeleteStatus("success");
        setDeleteStatusMessage(`success delete ${menuName}`);

        await wait(1000);
        setDeleteStatus(null);
        setDeleteStatusMessage("");
      })
      .catch((error: any) => {
        console.error(error);
        setDeleteStatus("error");
        setDeleteStatusMessage(
          `cannot delete ${menuName}, please try again later or ensure this menu item is not listed in any transactions.`
        );
      });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, itemId: 0, itemName: "" });
  };

  const getStockBadge = (stock: number) => {
    if (stock == 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock <= 5) return <Badge variant="destructive">Low Stock</Badge>;
    if (stock <= 15) return <Badge variant="secondary">Medium</Badge>;
    return (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 hover:bg-green-100"
      >
        In Stock
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Menus
        </h1>
      </div>

      {deleteStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {deleteStatusMessage}
          </AlertDescription>
        </Alert>
      )}

      {deleteStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {deleteStatusMessage}
          </AlertDescription>
        </Alert>
      )}

      {deleteStatus === "loading" && (
        <Alert className="border-slate-200 bg-slate-100">
          <Loader className="h-4 w-4" />
          <AlertDescription>{deleteStatusMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/menus/add">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Menu Item
                </Button>
              </Link>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-slate-200 focus:border-slate-300 focus:ring-slate-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700 h-12">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Price
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    Stock
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataMenus?.menus?.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <TableCell className="font-medium text-slate-600 py-4">
                      #{item.id.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      IDR {item.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {getStockBadge(item.stock)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {item.stock} units
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item.id)}
                          className="h-8 w-8 p-0 hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item.id, item.name)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1} to {endIndex} of{" "}
              {dataMenus?.pagination?.totalRows || 0} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-slate-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === page
                            ? "bg-slate-900 hover:bg-slate-800"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteMenuConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.itemName}
        itemType="menu item"
        itemId={deleteModal.itemId}
      />
    </div>
  );
}
