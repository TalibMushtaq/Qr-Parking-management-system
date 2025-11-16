import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Clock,
  Car,
  MapPin,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  Receipt,
} from "lucide-react";
import { parkingAPI } from "../services/api";
import toast from "react-hot-toast";

const ParkingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await parkingAPI.getHistory({ page, limit: 10 });
      setHistory(response.data.history);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to load parking history");
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchHistory(newPage);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-IN"),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading parking history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-6 w-6 text-blue-600" />
          Parking History
        </CardTitle>
        <p className="text-sm text-gray-600">
          View your past parking transactions and details
        </p>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Parking History
            </h3>
            <p className="text-gray-600">
              Your completed parking transactions will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {history.map((record, index) => {
                const completedDateTime = formatDateTime(record.completedTime);
                const parkedDateTime = formatDateTime(record.parkedTime);

                return (
                  <div
                    key={record._id || index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Slot & Vehicle Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">
                            Slot {record.slotId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            {record.vehicleNumber}
                          </span>
                        </div>
                      </div>

                      {/* Timing Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            Duration: {record.formattedDuration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Parked: {parkedDateTime.date} at{" "}
                            {parkedDateTime.time}
                          </span>
                        </div>
                      </div>

                      {/* Cost & Payment */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {record.formattedCost}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Status:
                          <span className="ml-1 capitalize text-green-600 font-medium">
                            {record.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Completion Info */}
                      <div className="space-y-2">
                        <div className="text-sm">
                          <div className="text-gray-600">Completed:</div>
                          <div className="font-medium">
                            {completedDateTime.date}
                          </div>
                          <div className="text-gray-600">
                            at {completedDateTime.time}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                        <div>
                          Reserved:{" "}
                          {formatDateTime(record.reservationTime).date} at{" "}
                          {formatDateTime(record.reservationTime).time}
                        </div>
                        <div>
                          Arrived: {formatDateTime(record.arrivalTime).date} at{" "}
                          {formatDateTime(record.arrivalTime).time}
                        </div>
                        <div>
                          Exit Requested:{" "}
                          {formatDateTime(record.leavingRequestTime).date} at{" "}
                          {formatDateTime(record.leavingRequestTime).time}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  {Math.min(
                    (pagination.currentPage - 1) * 10 + 1,
                    pagination.totalRecords
                  )}{" "}
                  to{" "}
                  {Math.min(
                    pagination.currentPage * 10,
                    pagination.totalRecords
                  )}{" "}
                  of {pagination.totalRecords} transactions
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ParkingHistory;
