import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const QRModal = ({
  isOpen,
  onClose,
  qrData,
  title,
  description,
  type = "reservation",
}) => {
  if (!isOpen) return null;

  const downloadQR = () => {
    const svg = document.querySelector(".qr-code-svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${type}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(qrData).then(() => {
        alert("QR code data copied to clipboard!");
      });
    }
  };

  const getQRColorScheme = () => {
    switch (type) {
      case "reservation":
        return { bg: "#dbeafe", border: "#3b82f6" }; // Blue
      case "occupied":
        return { bg: "#dcfce7", border: "#10b981" }; // Green
      case "leaving":
        return { bg: "#fef3c7", border: "#f59e0b" }; // Yellow
      default:
        return { bg: "#f3f4f6", border: "#6b7280" }; // Gray
    }
  };

  const colors = getQRColorScheme();

  // Parse QR data to display information
  const parseQRData = () => {
    try {
      const data = JSON.parse(qrData);
      return data;
    } catch (error) {
      return null;
    }
  };

  const parsedData = parseQRData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card
        className="w-full max-w-md mx-auto"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: "2px",
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
          {/* QR Code Display */}
          <div className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
            <QRCodeSVG
              value={qrData}
              size={250}
              className="qr-code-svg"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          {/* QR Data Information */}
          {parsedData && (
            <div className="bg-white/70 rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-sm mb-2">
                📋 QR Code Information:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* User Information */}
                {parsedData.user && (
                  <>
                    <div className="col-span-2 font-medium text-blue-700 border-b pb-1">
                      👤 User Details
                    </div>
                    <span className="font-medium">Name:</span>
                    <span>{parsedData.user.name}</span>
                    <span className="font-medium">Email:</span>
                    <span className="truncate">{parsedData.user.email}</span>
                    <span className="font-medium">Vehicle:</span>
                    <span>{parsedData.user.vehicleNumber}</span>
                  </>
                )}

                {/* Booking Information */}
                <div className="col-span-2 font-medium text-green-700 border-b pb-1 mt-2">
                  🎫 Booking Details
                </div>
                <span className="font-medium">Type:</span>
                <span className="capitalize">{parsedData.type}</span>
                {parsedData.slotId && (
                  <>
                    <span className="font-medium">Slot:</span>
                    <span>{parsedData.slotId}</span>
                  </>
                )}
                {parsedData.vehicleNumber && (
                  <>
                    <span className="font-medium">Vehicle:</span>
                    <span>{parsedData.vehicleNumber}</span>
                  </>
                )}

                {/* Time Information */}
                {(parsedData.reservationTime ||
                  parsedData.arrivalTime ||
                  parsedData.parkedTime) && (
                  <>
                    <div className="col-span-2 font-medium text-orange-700 border-b pb-1 mt-2">
                      ⏰ Time Details
                    </div>
                    {parsedData.reservationTime && (
                      <>
                        <span className="font-medium">Reserved:</span>
                        <span className="text-xs">
                          {new Date(
                            parsedData.reservationTime
                          ).toLocaleString()}
                        </span>
                      </>
                    )}
                    {parsedData.arrivalTime && (
                      <>
                        <span className="font-medium">Arrival:</span>
                        <span className="text-xs">
                          {new Date(parsedData.arrivalTime).toLocaleString()}
                        </span>
                      </>
                    )}
                    {parsedData.parkedTime && (
                      <>
                        <span className="font-medium">Parked:</span>
                        <span className="text-xs">
                          {new Date(parsedData.parkedTime).toLocaleString()}
                        </span>
                      </>
                    )}
                  </>
                )}

                {/* System Information */}
                <div className="col-span-2 font-medium text-gray-600 border-b pb-1 mt-2">
                  ⚙️ System Info
                </div>
                <span className="font-medium">Version:</span>
                <span>{parsedData.version || "N/A"}</span>
                <span className="font-medium">Generated:</span>
                <span className="text-xs">
                  {parsedData.timestamp
                    ? new Date(parsedData.timestamp).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          )}
          {/* QR Code Raw Data Preview */}
          <div className="text-xs text-center text-muted-foreground bg-white/50 p-2 rounded">
            <details>
              <summary className="cursor-pointer font-medium mb-1">
                🔍 Raw QR Data
              </summary>
              <p className="font-mono break-all text-left mt-2">{qrData}</p>
            </details>
          </div>{" "}
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={downloadQR} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={shareQR} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          {/* Instructions */}
          <div className="text-xs text-center text-muted-foreground space-y-1">
            {type === "reservation" && (
              <>
                <p>
                  📱{" "}
                  <strong>
                    Show this QR code to the admin to confirm your parking spot
                  </strong>
                </p>
                <p>
                  💡 Contains your complete reservation and user details for
                  verification
                </p>
              </>
            )}
            {type === "occupied" && (
              <>
                <p>
                  🚗 <strong>Keep this QR code with you while parked</strong>
                </p>
                <p>
                  💡 Contains your parking session details and payment
                  information
                </p>
              </>
            )}
            {type === "leaving" && (
              <>
                <p>
                  💰 <strong>Show this QR code when making payment</strong>
                </p>
                <p>
                  💡 Contains your complete parking duration and cost details
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRModal;
