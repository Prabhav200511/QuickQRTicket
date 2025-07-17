import React from 'react'
import {QrCode} from "lucide-react"

const AuthSidePanel = () => {
  return (
    <div className="hidden md:flex flex-col w-1/3 justify-center items-center text-center px-6">
        <QrCode size={150} strokeWidth={1.2} className="text-primary mb-4" />
        <p className="text-2xl font-bold text-primary">✨ QuickTicket</p>
        <p className="mt-2 text-base text-base-content opacity-80">
            Where moments become events and clicks turn into memories.
        </p>
    </div>

  )
}

export default AuthSidePanel
