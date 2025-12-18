export default function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'OK', cancelLabel = 'Cancel' }) {
 return (
 <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
 <div className="bg-white p-6 rounded-lg shadow">
 <p className="mb-4">{message}</p>
 <div className="flex justify-end gap-2">
 <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200">{cancelLabel}</button>
 <button onClick={onConfirm} className="px-4 py-2 rounded bg-accent text-white">{confirmLabel}</button>
 </div>
 </div>
 </div>
 );
}
