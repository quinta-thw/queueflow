import { useState } from 'react'
import { MapPin, Video, X } from 'lucide-react'

export default function JoinModal({ serviceName, onConfirm, onClose, loading }) {
  const [queueType, setQueueType] = useState(null)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-lg">Join {serviceName}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">How will you attend your session?</p>

        {/* Choice cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setQueueType('physical')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              queueType === 'physical'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              queueType === 'physical' ? 'bg-primary-500' : 'bg-gray-100'
            }`}>
              <MapPin size={22} className={queueType === 'physical' ? 'text-white' : 'text-gray-400'} />
            </div>
            <span className={`text-sm font-semibold ${queueType === 'physical' ? 'text-primary-600' : 'text-gray-700'}`}>
              Physical
            </span>
            <span className="text-xs text-gray-400 text-center leading-tight">Visit the office in person</span>
          </button>

          <button
            onClick={() => setQueueType('virtual')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              queueType === 'virtual'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              queueType === 'virtual' ? 'bg-green-500' : 'bg-gray-100'
            }`}>
              <Video size={22} className={queueType === 'virtual' ? 'text-white' : 'text-gray-400'} />
            </div>
            <span className={`text-sm font-semibold ${queueType === 'virtual' ? 'text-green-600' : 'text-gray-700'}`}>
              Virtual
            </span>
            <span className="text-xs text-gray-400 text-center leading-tight">Attend via online session</span>
          </button>
        </div>

        {/* Confirm */}
        <button
          onClick={() => queueType && onConfirm(queueType)}
          disabled={!queueType || loading}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Joining…</>
            : 'Confirm & Join Queue'}
        </button>
      </div>
    </div>
  )
}
