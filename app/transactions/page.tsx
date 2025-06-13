"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetTransactionsQuery } from "@/lib/features/transactions/transactionApi";
import qs from "querystring";

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: dataTransactions } = useGetTransactionsQuery(
    qs.stringify({ page: currentPage, limit: ITEMS_PER_PAGE, code: searchTerm })
  );

  // Calculate pagination
  const totalPages = dataTransactions?.pagination?.totalPages || 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Transactions
        </h1>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white">
          <div className="flex items-center justify-end">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search transactions..."
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
                    Order Code
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Item Name
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Item Total
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Item Price
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataTransactions?.transactions?.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <TableCell className="font-medium text-slate-600 py-4">
                      #{transaction.id.toString().padStart(3, "0")}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {transaction.orderCode}
                    </TableCell>
                    <TableCell className="text-slate-900">
                      {transaction.itemName}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {transaction.itemTotal}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      IDR {transaction.itemPrice.toLocaleString()}
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
              {dataTransactions?.pagination?.totalRows || 0} results
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
    </div>
  );
}
