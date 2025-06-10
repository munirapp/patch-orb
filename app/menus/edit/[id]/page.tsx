"use client";

import type React from "react";
import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import {
  useGetMenuDetailQuery,
  useUpdateMenuMutation,
} from "@/lib/features/menus/menuApi";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EditMenuPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // @ts-ignore
  const { id: idParam } = use(params);
  const id = Number.parseInt(idParam || "0");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alertStatus, setAlertStatus] = useState<"success" | "error" | null>(
    null
  );
  const [alertMessage, setAlertMessage] = useState("");

  const { data: dataMenuDetail, isSuccess: isSuccessGetMenuDetail } =
    useGetMenuDetailQuery(id);
  const [updateMenu] = useUpdateMenuMutation();

  // Load menu item data based on ID
  useEffect(() => {
    setIsLoading(true);
    if (!id) {
      router.push("/menus");
    }

    if (isSuccessGetMenuDetail) {
      setFormData({
        name: dataMenuDetail.menu.name,
        description: dataMenuDetail.menu.description,
        price: dataMenuDetail.menu.price.toString(),
        stock: dataMenuDetail.menu.stock.toString(),
        category: dataMenuDetail.menu.category,
      });
      setImagePreview(dataMenuDetail.menu.image);
      setIsLoading(false);
    }
  }, [id, isSuccessGetMenuDetail]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertStatus(null);
    setAlertMessage("");

    // Validate required fields
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.stock ||
      !imagePreview
    ) {
      setAlertStatus("error");
      setAlertMessage("Please fill in all required fields");
      return;
    }

    const editData = new FormData();
    editData.append("name", formData.name);
    editData.append("description", formData.description);
    editData.append("price", formData.price);
    editData.append("stock", formData.stock);
    editData.append("category", formData.category);

    if (imageFile) {
      editData.append("image", imageFile!);
    }

    const payload = { id, data: editData };

    updateMenu(payload)
      .catch((error) => {
        console.error(error);
        setAlertMessage("failed update menu, please try again later");
        setAlertStatus("error");
      })
      .then(async (res) => {
        if (res?.error) {
          setAlertMessage("failed update menu, please try again later");
          setAlertStatus("error");
          return;
        }

        setAlertMessage("success update menu");
        setAlertStatus("success");
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/menus">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Edit Menu Item
        </h1>
      </div>

      {/* Status Messages */}
      {alertStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}

      {alertStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter menu item name"
                    className="border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                    required
                  />
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium text-slate-700"
                  >
                    Category<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category"
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    placeholder="Enter menu item category"
                    className="border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                    required
                  />
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-700"
                  >
                    Description<span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter menu item description"
                    className="border-slate-200 focus:border-slate-300 focus:ring-slate-200 min-h-[120px] resize-none"
                    required
                  />
                </div>

                {/* Price and Stock Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="price"
                      className="text-sm font-medium text-slate-700"
                    >
                      Price (IDR)<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="stock"
                      className="text-sm font-medium text-slate-700"
                    >
                      Stock<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        handleInputChange("stock", e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      className="border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Image<span className="text-red-500">*</span>
                  </Label>

                  {!imagePreview ? (
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        isDragOver
                          ? "border-slate-400 bg-slate-50"
                          : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                        required={!imagePreview}
                      />
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                          <Upload className="h-8 w-8 text-slate-600" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-900">
                            Drop image here
                          </p>
                          <p className="text-xs text-slate-500">
                            or click to browse files
                          </p>
                          <p className="text-xs text-slate-400">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {imageFile ? imageFile.name : "Current image"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  size="lg"
                >
                  UPDATE
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
