"use client";

import { Download, QrCode } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  restaurantSlug: string;
}

// Simple QR code generator using an API service
function generateQRCodeURL(text: string, size: number = 300): string {
  // Using qrcode.tec-it.com API (free, no API key needed)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}

export function QRCodeModal({
  isOpen,
  onClose,
  tableNumber,
  restaurantSlug,
}: QRCodeModalProps) {
  const [qrUrl, setQrUrl] = useState("");
  const [tableUrl, setTableUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Get the base URL (client URL)
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";

      // Build the table ordering URL
      const url = `${baseUrl}/${restaurantSlug}/${tableNumber}`;
      setTableUrl(url);
      setQrUrl(generateQRCodeURL(url, 400));
    }
  }, [isOpen, restaurantSlug, tableNumber]);

  const handleDownload = async () => {
    try {
      // Fetch the QR code image
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `table-${tableNumber}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download QR code", error);
      // Fallback: open in new tab
      window.open(qrUrl, "_blank");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code for Table {tableNumber}
          </SheetTitle>
          <SheetDescription>
            Scan this QR code to access the ordering page for this table
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src={qrUrl}
              alt={`QR Code for Table ${tableNumber}`}
              className="w-64 h-64"
            />
          </div>

          <div className="text-center space-y-2 max-w-md">
            <p className="text-sm font-semibold text-foreground">
              Table Ordering URL:
            </p>
            <p className="text-xs text-muted-foreground break-all bg-muted p-3 rounded-md">
              {tableUrl}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="font-semibold"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
            <Button onClick={onClose} className="font-semibold">
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

