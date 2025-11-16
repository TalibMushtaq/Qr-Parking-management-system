import React from 'react';
import { useOutletContext } from 'react-router-dom';
import QRScanner from '../../components/QRScanner';

const AdminScanner = () => {
  const { setIsLoading } = useOutletContext();
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="text-gray-600 mt-1">Upload and scan QR codes to verify parking slots</p>
      </div>
      <QRScanner setIsLoading={setIsLoading} onClose={() => {}} />
    </div>
  );
};

export default AdminScanner;

