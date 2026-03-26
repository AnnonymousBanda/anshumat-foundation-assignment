import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { toast, ToastOptions } from 'react-toastify'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const defaultOptions: ToastOptions = {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: true,
}

export const notify = {
    success: (message: string, options?: ToastOptions) => {
        return toast.success(message, { ...defaultOptions, ...options })
    },
    error: (message: string, options?: ToastOptions) => {
        return toast.error(message, { ...defaultOptions, ...options })
    },
    info: (message: string, options?: ToastOptions) => {
        return toast.info(message, { ...defaultOptions, ...options })
    },
    warning: (message: string, options?: ToastOptions) => {
        return toast.warning(message, { ...defaultOptions, ...options })
    },
	
    apiError: (err: any) => {
        const message =
            err?.response?.data?.message ||
            'Something went wrong. Please try again.'
        return toast.error(message, { ...defaultOptions, autoClose: 5000 })
    },
}
