import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { parkingAPI } from "../services/api";
import toast from "react-hot-toast";
import ReservationCountdown from "./ReservationCountdown";
import {
  Clock,
  Car,
  CheckCircle,
  CreditCard,
  AlertCircle,
  Eye,
  QrCode,
  Maximize2,
} from "lucide-react";
import QRModal from "./QRModal";
import ReservationCountdown from "./ReservationCountdown";

const CurrentBooking = ({ booking, onCancel, onRefresh }) => {
  const [processing, setProcessing] = useState(false);
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    data: null,
    title: "",
    description: "",
    type: "",
  });

  const handleRequestOccupied = async () => {
    if (
      !window.confirm(
        "Have you parked your vehicle? This will request admin approval."
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      await parkingAPI.requestOccupied();
      toast.success("Occupied request submitted. Waiting for admin approval.");
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit request");
    } finally {
      setProcessing(false);
    }
  };

  const handleReservationExpired = () => {
    toast.error("Your reservation has expired. Please make a new reservation.");
    if (onRefresh) onRefresh();
  };

  const handleRequestLeaving = async () => {
    if (
      !window.confirm(
        "Are you ready to leave? This will calculate your parking cost."
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      const response = await parkingAPI.requestLeaving();
      toast.success("Leaving request submitted. Please make payment.");
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit request");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!window.confirm(`Pay ₹${booking.cost}?`)) {
      return;
    }

    try {
      setProcessing(true);
      await parkingAPI.processPayment();
      toast.success("Payment successful! Waiting for admin approval.");
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.error || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case "reserved":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            Reserved
          </span>
        );
      case "occupied":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            Parked
          </span>
        );
      case "leaving":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            Leaving
          </span>
        );
      default:
        return null;
    }
  };

  const reservationDate = booking.reservationTime
    ? new Date(booking.reservationTime)
    : null;
  const arrivalDate = booking.arrivalTime
    ? new Date(booking.arrivalTime)
    : null;
  const parkedDate = booking.parkedTime ? new Date(booking.parkedTime) : null;

  return (
    <Card className="mb-8 border-primary border-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>My Current Booking</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Slot {booking.id}</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <p>
              Vehicle: <strong>{booking.vehicleNumber}</strong>
            </p>
          </div>
          {reservationDate && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm">
                Reserved: {reservationDate.toLocaleString()}
              </p>
            </div>
          )}
          {arrivalDate && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm">Arrival: {arrivalDate.toLocaleString()}</p>
            </div>
          )}
          {parkedDate && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm">Parked: {parkedDate.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Reservation QR Code */}
        {booking.status === "reserved" && booking.reservationQrCode && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <p className="font-medium text-blue-800">Reservation QR Code</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  openQRModal(
                    booking.reservationQrCode,
                    "Reservation QR Code",
                    "Show this QR code to the admin to confirm your reservation",
                    "reservation"
                  )
                }
                className="text-blue-600 hover:text-blue-700"
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                View Full
              </Button>
            </div>

            <div className="flex justify-center p-3 bg-white rounded border">
              <QRCodeSVG value={booking.reservationQrCode} size={120} />
            </div>

            <div className="text-center space-y-3">
              {/* Countdown Timer */}
              {reservationDate && (
                <ReservationCountdown
                  reservationTime={booking.reservationTime}
                  onExpired={handleReservationExpired}
                />
              )}

              {booking.occupiedRequestStatus === "pending" && (
                <div className="flex items-center justify-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    Waiting for admin approval to park
                  </p>
                </div>
              )}

              {!booking.occupiedRequestStatus && (
                <>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-sm text-green-700 mb-2">
                      ✅ <strong>Ready to Park?</strong>
                    </p>
                    <p className="text-xs text-green-600">
                      You can request parking approval anytime within your
                      1-hour window
                    </p>
                  </div>

                  <Button
                    onClick={handleRequestOccupied}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />I Have Parked -
                    Request Approval
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Occupied QR Code */}
        {booking.status === "occupied" && booking.occupiedQrCode && (
          <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-green-600" />
                <p className="font-medium text-green-800">
                  Parking Token QR Code
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  openQRModal(
                    booking.occupiedQrCode,
                    "Parking Token QR Code",
                    "Keep this QR code with you while parked. Show to admin when leaving.",
                    "occupied"
                  )
                }
                className="text-green-600 hover:text-green-700"
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                View Full
              </Button>
            </div>

            <div className="flex justify-center p-3 bg-white rounded border">
              <QRCodeSVG value={booking.occupiedQrCode} size={120} />
            </div>

            <div className="text-center">
              {booking.leavingRequestStatus === "pending" ? (
                <div className="flex items-center justify-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    Leaving request pending admin approval
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleRequestLeaving}
                  disabled={processing}
                  className="w-full bg-green-600 hover:bg-green-700"
                  variant="default"
                >
                  <Car className="w-4 h-4 mr-2" />
                  Request to Leave
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Leaving/Payment Section */}
        {booking.status === "leaving" && (
          <div className="space-y-4 p-4 bg-yellow-50 rounded">
            {booking.cost > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Total Cost:</span>
                </div>
                <span className="text-2xl font-bold">₹{booking.cost}</span>
              </div>
            )}
            {booking.paymentStatus === "pending" && (
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            )}
            {booking.paymentStatus === "paid" && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">
                  Payment Completed. Waiting for admin approval.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          {booking.status === "reserved" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onCancel}
              disabled={processing}
              className="flex-1"
            >
              Cancel Reservation
            </Button>
          )}
          {(booking.status === "occupied" || booking.status === "leaving") && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={processing}
              className="flex-1"
            >
              Cancel Booking
            </Button>
          )}
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

export default CurrentBooking;
