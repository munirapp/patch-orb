"use client";

import { useState, useMemo } from "react";
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
  Search,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetOrdersQuery,
  useRejectOrderMutation,
} from "@/lib/features/orders/orderApi";
import qs from "querystring";
import { Order } from "@/interfaces/orders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RejectOrderConfirmationModal } from "@/components/reject-order-confirmation-modal";
import { wait } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { data: dataOrders } = useGetOrdersQuery(
    qs.stringify({ page: currentPage, limit: ITEMS_PER_PAGE, code: searchTerm })
  );
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    orderId: 0,
    orderCode: "",
  });
  const [rejectStatus, setRejectStatus] = useState<
    "success" | "error" | "loading" | null
  >(null);
  const [rejectStatusMessage, setRejectStatusMessage] = useState("");
  const [rejectOrder] = useRejectOrderMutation();

  // Calculate pagination
  const totalPages = dataOrders?.pagination?.totalPages || 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSeeDetails = (id: number) => {
    router.push(`/orders/details/${id}`);
  };

  const handleConfirm = (id: number) => {
    router.push(`/orders/confirm/${id}`);
  };

  const handleRejectClick = (orderId: number, orderCode: string) => {
    setRejectModal({ isOpen: true, orderCode, orderId });
  };

  const handleRejectCancel = () => {
    setRejectModal({ isOpen: false, orderCode: "", orderId: 0 });
  };

  const handleRejectConfirm = (orderId: number, orderCode: string) => {
    setRejectStatus("loading");
    setRejectStatusMessage("rejecting order, please wait...");

    rejectOrder(orderId)
      .then(async (res) => {
        if (res?.error) {
          setRejectStatus("error");
          setRejectStatusMessage(
            `cannot reject ${orderCode}, please try again later`
          );
          return;
        }

        setRejectStatus("success");
        setRejectStatusMessage(`success reject ${orderCode}`);

        await wait(1000);
        setRejectStatus(null);
        setRejectStatusMessage("");
      })
      .catch((error: any) => {
        console.error(error);
        setRejectStatus("error");
        setRejectStatusMessage(
          `cannot reject ${orderCode}, please try again later`
        );
      });
  };

  const getStatusBadge = (status: Order["status"]) => {
    if (status === "PAID") {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          PAID
        </Badge>
      );
    }
    if (status === "REJECTED") {
      return <Badge variant={"destructive"}>REJECTED</Badge>;
    }
    return <Badge variant="secondary">UNPAID</Badge>;
  };

  const renderActionButtons = (order: {
    id: number;
    code: string;
    status: Order["status"];
  }) => {
    if (order.status === "PAID" || order.status === "REJECTED") {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSeeDetails(order.id)}
          className="h-8 px-3 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
        >
          <Eye className="mr-2 h-4 w-4" />
          See Details
        </Button>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleConfirm(order.id)}
          className="h-8 px-3 hover:bg-green-50 text-green-600 hover:text-green-700"
        >
          <Check className="mr-1 h-4 w-4" />
          Confirm
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRejectClick(order.id, order.code)}
          className="h-8 px-3 hover:bg-red-50 text-red-600 hover:text-red-700"
        >
          <X className="mr-1 h-4 w-4" />
          Reject
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Orders
        </h1>
      </div>

      {rejectStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {rejectStatusMessage}
          </AlertDescription>
        </Alert>
      )}

      {rejectStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {rejectStatusMessage}
          </AlertDescription>
        </Alert>
      )}

      {rejectStatus === "loading" && (
        <Alert className="border-slate-200 bg-slate-100">
          <Loader className="h-4 w-4" />
          <AlertDescription>{rejectStatusMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white">
          <div className="flex items-center justify-end">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search orders..."
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
                    Code
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Total Final Price
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataOrders?.orders?.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <TableCell className="font-medium text-slate-600 py-4">
                      #{order.id.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {order.code}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      IDR {order.totalFinalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(order.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {renderActionButtons(order)}
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
              {dataOrders?.pagination?.totalRows || 0} results
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

      {/* Reject Confirmation Modal */}
      <RejectOrderConfirmationModal
        isOpen={rejectModal.isOpen}
        onClose={handleRejectCancel}
        onConfirm={handleRejectConfirm}
        orderCode={rejectModal.orderCode}
        orderId={rejectModal.orderId}
      />
    </div>
  );
}
