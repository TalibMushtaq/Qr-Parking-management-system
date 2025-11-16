import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';

const QRScanner = ({ setIsLoading, onClose }) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      setError('Please select an image file');
      return;
    }

    setIsLoading(true);
    setError('');
    setScanResult(null);

    try {
      const response = await adminAPI.scanQR(file);
      setScanResult(response.data);
      if (response.data.valid) {
        toast.success('QR code scanned successfully!');
      } else {
        toast.error(response.data.message || 'Invalid QR code');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to scan QR code';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>Upload an image containing a QR code to verify parking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qrFileInput">Choose QR Image</Label>
          <input
            type="file"
            id="qrFileInput"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {scanResult && (
          <div className="space-y-2 p-4 rounded-lg border-2">
            <h4 className="font-semibold text-lg mb-3">Scan Result</h4>
            {scanResult.valid ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-green-800">Valid Parking</h4>
                <p className="text-green-700">
                  Slot ID: <strong>{scanResult.slot.id}</strong>
                </p>
                <p className="text-green-700">
                  Vehicle Number: <strong>{scanResult.slot.vehicleNumber}</strong>
                </p>
                <p className="text-green-700">
                  Parking Duration:{' '}
                  <strong>
                    {scanResult.slot.duration.hours}h {scanResult.slot.duration.minutes}m
                  </strong>
                </p>
                <p className="text-green-700">
                  Booked at: {new Date(scanResult.slot.bookingTime).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800">Invalid Parking</h4>
                <p className="text-red-700">{scanResult.message || 'This slot is not currently occupied.'}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={onClose}>
          Close Scanner
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRScanner;

