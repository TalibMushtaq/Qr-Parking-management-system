import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { QrCode, Eye, Download, Copy } from "lucide-react";
import QRModal from "./QRModal";
import toast from "react-hot-toast";

const QRCodeSummary = ({ booking }) => {
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    data: null,
    title: "",
    description: "",
    type: "",
  });

  if (!booking) return null;

  const openQRModal = (data, title, description, type) => {
    setQrModal({ isOpen: true, data, title, description, type });
  };

  const closeQRModal = () => {
    setQrModal({
      isOpen: false,
      data: null,
      title: "",
      description: "",
      type: "",
    });
  };

  const copyQRData = (data) => {
    navigator.clipboard
      .writeText(data)
      .then(() => {
        toast.success("QR code data copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy QR code data");
      });
  };

  const getQRCodes = () => {
    const codes = [];

    if (booking.reservationQrCode && booking.status === "reserved") {
      codes.push({
        type: "reservation",
        data: booking.reservationQrCode,
        title: "Reservation QR",
        description: "Show this to admin to confirm parking",
        color: "blue",
        icon: QrCode,
        status: booking.occupiedRequestStatus,
      });
    }

    if (
      booking.occupiedQrCode &&
      (booking.status === "occupied" || booking.status === "leaving")
    ) {
      codes.push({
        type: "occupied",
        data: booking.occupiedQrCode,
        title: "Parking Token QR",
        description: "Keep this while parked",
        color: "green",
        icon: QrCode,
        status: booking.leavingRequestStatus,
      });
    }

    return codes;
  };

  const qrCodes = getQRCodes();

  if (qrCodes.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Your QR Codes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qrCodes.map((qr, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                qr.color === "blue"
                  ? "bg-blue-50 border-blue-200"
                  : qr.color === "green"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4
                    className={`font-medium ${
                      qr.color === "blue"
                        ? "text-blue-800"
                        : qr.color === "green"
                        ? "text-green-800"
                        : "text-yellow-800"
                    }`}
                  >
                    {qr.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      qr.color === "blue"
                        ? "text-blue-600"
                        : qr.color === "green"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {qr.description}
                  </p>
                  {qr.status === "pending" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>

              {/* Mini QR Preview */}
              <div className="flex justify-center mb-3 bg-white p-2 rounded">
                <QRCodeSVG value={qr.data} size={80} />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    openQRModal(qr.data, qr.title, qr.description, qr.type)
                  }
                  className="flex-1"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyQRData(qr.data)}
                  className="flex-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-2">💡 QR Code Tips:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Keep your screen brightness high when showing QR codes</li>
            <li>• Save or screenshot important QR codes for offline access</li>
            <li>• Show the full-screen QR modal for better scanning</li>
            {booking.status === "reserved" && (
              <li>• Present your reservation QR to the parking admin</li>
            )}
            {booking.status === "occupied" && (
              <li>• Keep your parking token QR ready for when you leave</li>
            )}
          </ul>
        </div>
      </CardContent>

      {/* QR Modal */}
      <QRModal
        isOpen={qrModal.isOpen}
        onClose={closeQRModal}
        qrData={qrModal.data}
        title={qrModal.title}
        description={qrModal.description}
        type={qrModal.type}
      />
    </Card>
  );
};

export default QRCodeSummary;
