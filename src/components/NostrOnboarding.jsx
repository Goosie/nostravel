import React, { useState } from 'react'
import { Key, UserPlus, Download, Upload, Eye, EyeOff, Copy, Check } from 'lucide-react'

const NostrOnboarding = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState('welcome') // welcome, generate, import, profile
  const [keys, setKeys] = useState(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [importKey, setImportKey] = useState('')
  const [profile, setProfile] = useState({ name: '' })
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generateNewKeys = async () => {
    try {
      const NostrService = (await import('../services/NostrService')).default
      const newKeys = NostrService.generateKeys()
      setKeys(newKeys)
      setStep('profile')
      setError('')
    } catch (err) {
      setError('Failed to generate keys: ' + err.message)
    }
  }

  const importExistingKeys = async () => {
    if (!importKey.trim()) {
      setError('Please enter your nsec key')
      return
    }

    try {
      const NostrService = (await import('../services/NostrService')).default
      const importedKeys = NostrService.importKeys(importKey.trim())
      setKeys(importedKeys)
      setStep('profile')
      setError('')
    } catch (err) {
      setError('Invalid nsec key: ' + err.message)
    }
  }

  const completeSetup = () => {
    if (!profile.name.trim()) {
      setError('Please enter your name')
      return
    }

    onComplete(keys, profile)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadKeys = () => {
    const keyData = {
      npub: keys.npub,
      nsec: keys.nsec,
      created: new Date().toISOString(),
      app: 'Nostravel - Fügen Winter Sports'
    }
    
    const blob = new Blob([JSON.stringify(keyData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nostravel-keys.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Nostravel!</h2>
            <p className="text-gray-600">
              To share your location and photos with family, you need a Nostr identity.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStep('generate')}
              className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Create New Identity
            </button>

            <button
              onClick={() => setStep('import')}
              className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Import Existing Keys
            </button>

            <button
              onClick={onSkip}
              className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
            >
              Skip for now (demo mode)
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'generate') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate New Keys</h2>
            <p className="text-gray-600">
              We'll create a new Nostr identity for you. Make sure to save your private key!
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={generateNewKeys}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Generate Keys
            </button>

            <button
              onClick={() => setStep('welcome')}
              className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
            >
              Back
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 'import') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Existing Keys</h2>
            <p className="text-gray-600">
              Enter your existing nsec private key to use your Nostr identity.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Private Key (nsec...)
              </label>
              <input
                type="password"
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
                placeholder="nsec1..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={importExistingKeys}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Import Keys
            </button>

            <button
              onClick={() => setStep('welcome')}
              className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
            >
              Back
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 'profile' && keys) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600">
              Set up your profile and save your keys securely.
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Public Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Public Key (npub) - Share this with family
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keys.npub}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(keys.npub)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Private Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Private Key (nsec) - Keep this secret!
              </label>
              <div className="flex gap-2">
                <input
                  type={showPrivateKey ? "text" : "password"}
                  value={keys.nsec}
                  readOnly
                  className="flex-1 px-3 py-2 bg-red-50 border border-red-300 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(keys.nsec)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Never share your private key! Save it securely.
              </p>
            </div>

            {/* Download Keys */}
            <button
              onClick={downloadKeys}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Keys as File
            </button>

            {/* Complete Setup */}
            <button
              onClick={completeSetup}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Complete Setup
            </button>

            <button
              onClick={() => setStep('welcome')}
              className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
            >
              Back
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default NostrOnboarding