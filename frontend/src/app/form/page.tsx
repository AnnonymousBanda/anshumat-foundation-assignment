'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import SurfaceCard from '@/components/common/SurfaceCard'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { notify } from '@/lib/utils'
import { Eye, File, FileText, Info, MapPin, User, Users } from 'lucide-react'

import useDebounce from '@/hooks/useDebounce'
import { useSearchParams } from 'next/navigation'

const steps = [
    'Personal Info',
    'Family Details',
    'Address',
    'Documents',
    'Review',
]

const genderOptions = ['MALE', 'FEMALE', 'RATHER NOT SAY']

const indianStateCityMap: Record<string, string[]> = {
    'Andaman and Nicobar Islands': ['Port Blair', 'Diglipur', 'Mayabunder'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Tawang', 'Pasighat'],
    Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
    Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
    Chandigarh: ['Chandigarh'],
    Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
    Delhi: ['New Delhi', 'North Delhi', 'South Delhi', 'Dwarka'],
    Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
    Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
    Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
    Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'],
    Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
    Ladakh: ['Leh', 'Kargil'],
    Lakshadweep: ['Kavaratti', 'Agatti', 'Amini'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
    Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
    Manipur: ['Imphal', 'Bishnupur', 'Churachandpur', 'Thoubal'],
    Meghalaya: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'],
    Mizoram: ['Aizawl', 'Lunglei', 'Saiha', 'Champhai'],
    Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'],
    Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur'],
    Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
    Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota'],
    Sikkim: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
    Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
    Tripura: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Prayagraj'],
    Uttarakhand: ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee'],
    'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur'],
}

const addressProofOptions = [
    'Electricity Bill',
    'Water Bill',
    'Bank Statement',
    'Rental Agreement',
    'Voter ID',
]

const selectClassName =
    'w-full h-8 rounded-md border border-input bg-background px-2 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

type FormDataState = {
    personal: {
        firstName: string
        lastName: string
        dob: string
        gender: string
        birthState: string
        placeOfBirth: string
        email: string
        phone: string
    }
    family: {
        motherName: string
        fatherName: string
        spouseName: string
    }
    address: {
        addressLine1: string
        addressLine2: string
        city: string
        state: string
        pincode: string
        country: string
    }
    documents: {
        aadhaarNumber: string
        panNumber: string
        addressProofType: string
        passportPhotoName: string
        idProofName: string
    }
}

export default function ApplicationFormPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentStep, setCurrentStep] = useState(() => {
        const stepFromQuery = searchParams.get('step')
        if (!stepFromQuery) {
            router.replace('?step=1')
            return 1
        }

        const parsed = parseInt(stepFromQuery)
        if (Number.isNaN(parsed) || parsed < 1) {
            router.replace('?step=1')
            return 1
        }

        if (parsed > steps.length) {
            router.replace(`?step=${steps.length}`)
            return steps.length
        }

        return parsed
    })

    const [savedAt, setSavedAt] = useState('')
    const [missingRequired, setMissingRequired] = useState<string[]>([])
    const [formData, setFormData] = useState<FormDataState>({
        personal: {
            firstName: '',
            lastName: '',
            dob: '',
            gender: '',
            birthState: '',
            placeOfBirth: '',
            email: '',
            phone: '',
        },
        family: {
            motherName: '',
            fatherName: '',
            spouseName: '',
        },
        address: {
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
        },
        documents: {
            aadhaarNumber: '',
            panNumber: '',
            addressProofType: '',
            passportPhotoName: '',
            idProofName: '',
        },
    })

    const debouncedCounter = useRef(0)
    const debouncedFormData = useDebounce(formData, 500)
    useEffect(() => {
        if (debouncedFormData && debouncedCounter.current > 0) updateSavedAt()
        debouncedCounter.current += 1
    }, [debouncedFormData])

    const updateSavedAt = () => {
        setSavedAt(
            new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
            }),
        )

        // patch to backend can be done here to save progress
    }

    const updatePersonalField = (
        key: keyof FormDataState['personal'],
        value: string,
    ) => {
        const fieldKey = `personal.${key}`
        setFormData((prev) => ({
            ...prev,
            personal: {
                ...prev.personal,
                [key]: value,
            },
        }))
        setMissingRequired((prev) => prev.filter((item) => item !== fieldKey))
        // updateSavedAt()
    }

    const updateFamilyField = (
        key: keyof FormDataState['family'],
        value: string,
    ) => {
        const fieldKey = `family.${key}`
        setFormData((prev) => ({
            ...prev,
            family: {
                ...prev.family,
                [key]: value,
            },
        }))
        setMissingRequired((prev) => prev.filter((item) => item !== fieldKey))
        // updateSavedAt()
    }

    const updateAddressField = (
        key: keyof FormDataState['address'],
        value: string,
    ) => {
        const fieldKey = `address.${key}`
        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [key]: value,
            },
        }))
        setMissingRequired((prev) => prev.filter((item) => item !== fieldKey))
        // updateSavedAt()
    }

    const updateDocumentsField = (
        key: keyof FormDataState['documents'],
        value: string,
    ) => {
        const fieldKey = `documents.${key}`
        setFormData((prev) => ({
            ...prev,
            documents: {
                ...prev.documents,
                [key]: value,
            },
        }))
        setMissingRequired((prev) => prev.filter((item) => item !== fieldKey))
        // updateSavedAt()
    }

    const sectionTitle = useMemo(() => steps[currentStep - 1], [currentStep])
    const addressStateOptions = useMemo(
        () => Object.keys(indianStateCityMap),
        [],
    )
    const addressCityOptions = useMemo(
        () =>
            formData.address.state
                ? indianStateCityMap[formData.address.state] || []
                : [],
        [formData.address.state],
    )
    const birthCityOptions = useMemo(
        () =>
            formData.personal.birthState
                ? indianStateCityMap[formData.personal.birthState] || []
                : [],
        [formData.personal.birthState],
    )

    const getRequiredFieldsForStep = (step: number) => {
        if (step === 0) {
            return [
                ['personal.firstName', formData.personal.firstName],
                ['personal.lastName', formData.personal.lastName],
                ['personal.dob', formData.personal.dob],
                ['personal.gender', formData.personal.gender],
                ['personal.birthState', formData.personal.birthState],
                ['personal.placeOfBirth', formData.personal.placeOfBirth],
                ['personal.email', formData.personal.email],
                ['personal.phone', formData.personal.phone],
            ] as Array<[string, string]>
        }

        if (step === 1) {
            return [
                ['family.motherName', formData.family.motherName],
                ['family.fatherName', formData.family.fatherName],
            ] as Array<[string, string]>
        }

        if (step === 2) {
            return [
                ['address.addressLine1', formData.address.addressLine1],
                ['address.city', formData.address.city],
                ['address.state', formData.address.state],
                ['address.pincode', formData.address.pincode],
            ] as Array<[string, string]>
        }

        if (step === 3) {
            return [
                ['documents.aadhaarNumber', formData.documents.aadhaarNumber],
                ['documents.panNumber', formData.documents.panNumber],
                [
                    'documents.addressProofType',
                    formData.documents.addressProofType,
                ],
                [
                    'documents.passportPhotoName',
                    formData.documents.passportPhotoName,
                ],
                ['documents.idProofName', formData.documents.idProofName],
            ] as Array<[string, string]>
        }

        return [] as Array<[string, string]>
    }

    const validateCurrentStep = () => {
        const requiredFields = getRequiredFieldsForStep(currentStep - 1)
        const missing = requiredFields
            .filter(([, value]) => !value || !value.trim())
            .map(([key]) => key)

        const invalidLengthFields: string[] = []
        if (currentStep === 4) {
            const aadhaarDigits = formData.documents.aadhaarNumber.replace(
                /\D/g,
                '',
            )
            const panValue = formData.documents.panNumber.trim()

            if (aadhaarDigits.length > 0 && aadhaarDigits.length !== 12) {
                invalidLengthFields.push('documents.aadhaarNumber')
            }

            if (panValue.length > 0 && panValue.length !== 10) {
                invalidLengthFields.push('documents.panNumber')
            }
        }

        const errors = [...new Set([...missing, ...invalidLengthFields])]

        if (missing.length > 0) {
            notify.info(
                'Please fill all required fields marked with * before moving to the next step.',
            )
        }

        if (invalidLengthFields.length > 0) {
            notify.error(
                'Aadhaar must be 12 digits and PAN must be 10 characters long.',
            )
        }

        setMissingRequired(errors)

        return errors.length === 0
    }

    const validateAllRequiredFields = () => {
        const allRequiredFields = [0, 1, 2, 3].flatMap((step) =>
            getRequiredFieldsForStep(step),
        )
        const missing = allRequiredFields
            .filter(([, value]) => !value || !value.trim())
            .map(([key]) => key)

        const invalidLengthFields: string[] = []
        const aadhaarDigits = formData.documents.aadhaarNumber.replace(
            /\D/g,
            '',
        )
        const panValue = formData.documents.panNumber.trim()

        if (aadhaarDigits.length > 0 && aadhaarDigits.length !== 12) {
            invalidLengthFields.push('documents.aadhaarNumber')
        }

        if (panValue.length > 0 && panValue.length !== 10) {
            invalidLengthFields.push('documents.panNumber')
        }

        const errors = [...new Set([...missing, ...invalidLengthFields])]

        if (missing.length > 0) {
            notify.info(
                'Please fill all required fields marked with * before moving to the next step.',
            )
        }

        if (invalidLengthFields.length > 0) {
            notify.error(
                'Aadhaar must be 12 digits and PAN must be 10 characters long.',
            )
        }

        setMissingRequired(errors)

        if (errors.length === 0) return true

        const firstError = errors[0]
        let targetStep = 1
        if (firstError.startsWith('family.')) targetStep = 2
        if (firstError.startsWith('address.')) targetStep = 3
        if (firstError.startsWith('documents.')) targetStep = 4

        setCurrentStep(targetStep)
        router.replace(`?step=${targetStep}`)

        return false
    }

    const goNext = () => {
        if (currentStep === steps.length) {
            if (!validateAllRequiredFields()) return

            router.push('/upload')
            return
        }

        if (!validateCurrentStep()) {
            return
        }

        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1)
            router.replace('?step=' + (currentStep + 1))
            return
        }
    }

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1)
            router.replace('?step=' + (currentStep - 1))
        }
    }

    const goToPastStep = (targetStep: number) => {
        if (targetStep < 1 || targetStep >= currentStep) return

        setCurrentStep(targetStep)
        router.replace(`?step=${targetStep}`)
    }

    const renderStepContent = () => {
        if (currentStep === 1) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2">First Name *</label>
                            <Input
                                placeholder="As per Aadhaar"
                                className={`h-12 text-base ${missingRequired.includes('personal.firstName') ? 'border-destructive' : ''}`}
                                value={formData.personal.firstName}
                                onChange={(e) =>
                                    updatePersonalField(
                                        'firstName',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Last Name *</label>
                            <Input
                                placeholder="As per Aadhaar"
                                className={`h-12 text-base ${missingRequired.includes('personal.lastName') ? 'border-destructive' : ''}`}
                                value={formData.personal.lastName}
                                onChange={(e) =>
                                    updatePersonalField(
                                        'lastName',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2">
                                Date of Birth *
                            </label>
                            <Input
                                type="date"
                                className={`h-12 text-base ${missingRequired.includes('personal.dob') ? 'border-destructive' : ''}`}
                                value={formData.personal.dob}
                                onChange={(e) =>
                                    updatePersonalField('dob', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Gender *</label>
                            <select
                                className={`${selectClassName} ${missingRequired.includes('personal.gender') ? 'border-destructive' : ''}`}
                                value={formData.personal.gender}
                                onChange={(e) =>
                                    updatePersonalField(
                                        'gender',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">Select Gender</option>
                                {genderOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2">Birth State *</label>
                            <select
                                className={`${selectClassName} ${missingRequired.includes('personal.birthState') ? 'border-destructive' : ''}`}
                                value={formData.personal.birthState}
                                onChange={(e) => {
                                    updatePersonalField(
                                        'birthState',
                                        e.target.value,
                                    )
                                    updatePersonalField('placeOfBirth', '')
                                }}
                            >
                                <option value="">Select State</option>
                                {addressStateOptions.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2">
                                Place of Birth *
                            </label>
                            <select
                                className={`${selectClassName} ${missingRequired.includes('personal.placeOfBirth') ? 'border-destructive' : ''}`}
                                value={formData.personal.placeOfBirth}
                                onChange={(e) =>
                                    updatePersonalField(
                                        'placeOfBirth',
                                        e.target.value,
                                    )
                                }
                                disabled={!formData.personal.birthState}
                            >
                                <option value="">Select City</option>
                                {birthCityOptions.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2">Email *</label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                className={`h-12 text-base ${missingRequired.includes('personal.email') ? 'border-destructive' : ''}`}
                                value={formData.personal.email}
                                onChange={(e) =>
                                    updatePersonalField('email', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block mb-2">
                                Mobile Number *
                            </label>
                            <div className="flex items-center gap-0">
                                <span className="inline-flex h-12 items-center rounded-l-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground">
                                    +91
                                </span>
                                <Input
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={10}
                                    placeholder="9876543210"
                                    className={`h-12 text-base ${missingRequired.includes('personal.phone') ? 'rounded-l-none border-destructive' : ''}`}
                                    value={formData.personal.phone}
                                    onChange={(e) =>
                                        updatePersonalField(
                                            'phone',
                                            e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 10),
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        if (currentStep === 2) {
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block mb-2">Mother's Name *</label>
                        <Input
                            placeholder="As per Aadhaar"
                            className={`h-12 text-base ${missingRequired.includes('family.motherName') ? 'border-destructive' : ''}`}
                            value={formData.family.motherName}
                            onChange={(e) =>
                                updateFamilyField('motherName', e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Father's Name *</label>
                        <Input
                            placeholder="As per Aadhaar"
                            className={`h-12 text-base ${missingRequired.includes('family.fatherName') ? 'border-destructive' : ''}`}
                            value={formData.family.fatherName}
                            onChange={(e) =>
                                updateFamilyField('fatherName', e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <label>Spouse's Name</label>
                            <span title="Leave blank if unmarried. Name must match marriage certificate.">
                                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </span>
                        </div>
                        <Input
                            placeholder="Leave blank if not applicable"
                            className="h-12 text-base"
                            value={formData.family.spouseName}
                            onChange={(e) =>
                                updateFamilyField('spouseName', e.target.value)
                            }
                        />
                    </div>
                </div>
            )
        }

        if (currentStep === 3) {
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block mb-2">Address Line 1 *</label>
                        <Input
                            placeholder="House/Flat No, Street"
                            className={`h-12 text-base ${missingRequired.includes('address.addressLine1') ? 'border-destructive' : ''}`}
                            value={formData.address.addressLine1}
                            onChange={(e) =>
                                updateAddressField(
                                    'addressLine1',
                                    e.target.value,
                                )
                            }
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Address Line 2</label>
                        <Input
                            placeholder="Landmark, Area"
                            className="h-12 text-base"
                            value={formData.address.addressLine2}
                            onChange={(e) =>
                                updateAddressField(
                                    'addressLine2',
                                    e.target.value,
                                )
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2">City *</label>
                            <select
                                className={`${selectClassName} ${missingRequired.includes('address.city') ? 'border-destructive' : ''}`}
                                value={formData.address.city}
                                onChange={(e) =>
                                    updateAddressField('city', e.target.value)
                                }
                                disabled={!formData.address.state}
                            >
                                <option value="">Select City</option>
                                {addressCityOptions.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">State *</label>
                            <select
                                className={`${selectClassName} ${missingRequired.includes('address.state') ? 'border-destructive' : ''}`}
                                value={formData.address.state}
                                onChange={(e) => {
                                    updateAddressField('state', e.target.value)
                                    updateAddressField('city', '')
                                }}
                            >
                                <option value="">Select State</option>
                                {addressStateOptions.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2">PIN Code *</label>
                            <Input
                                placeholder="6-digit PIN"
                                className={`h-12 text-base ${missingRequired.includes('address.pincode') ? 'border-destructive' : ''}`}
                                value={formData.address.pincode}
                                onChange={(e) =>
                                    updateAddressField(
                                        'pincode',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Country</label>
                            <Input
                                className="h-12 text-base bg-background/60"
                                value={formData.address.country}
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            )
        }

        if (currentStep === 4) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2">
                                Aadhaar Number *
                            </label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                maxLength={14}
                                placeholder="1234-5678-9012"
                                className={`h-12 text-base ${missingRequired.includes('documents.aadhaarNumber') ? 'border-destructive' : ''}`}
                                value={formData.documents.aadhaarNumber}
                                onChange={(e) =>
                                    updateDocumentsField(
                                        'aadhaarNumber',
                                        e.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 12)
                                            .replace(/(\d{4})(?=\d)/g, '$1-'),
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="block mb-2">PAN Number *</label>
                            <Input
                                type="text"
                                maxLength={10}
                                placeholder="ABCDE1234F"
                                className={`h-12 text-base ${missingRequired.includes('documents.panNumber') ? 'border-destructive' : ''}`}
                                value={formData.documents.panNumber}
                                onChange={(e) =>
                                    updateDocumentsField(
                                        'panNumber',
                                        e.target.value
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, '')
                                            .slice(0, 10),
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2">
                            Address Proof Type *
                        </label>
                        <select
                            className={`${selectClassName} ${missingRequired.includes('documents.addressProofType') ? 'border-destructive' : ''}`}
                            value={formData.documents.addressProofType}
                            onChange={(e) =>
                                updateDocumentsField(
                                    'addressProofType',
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">Select Address Proof</option>
                            {addressProofOptions.map((proof) => (
                                <option key={proof} value={proof}>
                                    {proof}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2">
                                Passport Photo *
                            </label>
                            <Input
                                type="file"
                                accept="image/*"
                                className={`h-12 text-base file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 ${missingRequired.includes('documents.passportPhotoName') ? 'border-destructive' : ''}`}
                                onChange={(e) =>
                                    updateDocumentsField(
                                        'passportPhotoName',
                                        e.target.files?.[0]?.name ?? '',
                                    )
                                }
                            />
                            {formData.documents.passportPhotoName && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    <span className="mr-1">Selected:</span>
                                    <span
                                        className="inline-block max-w-full align-bottom truncate"
                                        title={
                                            formData.documents.passportPhotoName
                                        }
                                    >
                                        {formData.documents.passportPhotoName}
                                    </span>
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-2">ID Proof *</label>
                            <Input
                                type="file"
                                className={`h-12 text-base file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 ${missingRequired.includes('documents.idProofName') ? 'border-destructive' : ''}`}
                                onChange={(e) =>
                                    updateDocumentsField(
                                        'idProofName',
                                        e.target.files?.[0]?.name ?? '',
                                    )
                                }
                            />
                            {formData.documents.idProofName && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    <span className="mr-1">Selected:</span>
                                    <span
                                        className="inline-block max-w-full align-bottom truncate"
                                        title={formData.documents.idProofName}
                                    >
                                        {formData.documents.idProofName}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )
        }

        const renderField = (label, value) => (
            <div className="flex flex-col space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {label}
                </span>
                <span className="text-sm font-semibold text-foreground">
                    {value || 'Not provided'}
                </span>
            </div>
        )

        const renderDocument = (label, value, isFile = false) => (
            <div className="flex flex-col space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {label}
                </span>
                {isFile && value ? (
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30 group transition-colors hover:bg-muted/50">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="p-2 bg-primary/10 text-primary rounded-md">
                                <File className="w-4 h-4" />
                            </div>
                            <span
                                className="text-sm font-medium truncate max-w-[200px]"
                                title={value}
                            >
                                {value}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="flex items-center space-x-1 text-xs font-semibold text-primary opacity-80 hover:opacity-100 transition-opacity"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                        </button>
                    </div>
                ) : (
                    <span className="text-sm font-semibold text-foreground">
                        {value || 'Not provided'}
                    </span>
                )}
            </div>
        )

        return (
            <div className="space-y-6 w-full max-w-3xl mx-auto">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b border-border flex items-center space-x-2">
                        <User className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-semibold text-primary">
                            Personal Info
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        {renderField('First Name', formData.personal.firstName)}
                        {renderField('Last Name', formData.personal.lastName)}
                        {renderField('Date of Birth', formData.personal.dob)}
                        {renderField('Gender', formData.personal.gender)}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b border-border flex items-center space-x-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-semibold text-primary">
                            Family Details
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        {renderField(
                            "Mother's Name",
                            formData.family.motherName,
                        )}
                        {renderField(
                            "Father's Name",
                            formData.family.fatherName,
                        )}
                        {renderField(
                            "Spouse's Name",
                            formData.family.spouseName,
                        )}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b border-border flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-semibold text-primary">
                            Address
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <div className="md:col-span-2">
                            {renderField(
                                'Address Line 1',
                                formData.address.addressLine1,
                            )}
                        </div>
                        <div className="md:col-span-2">
                            {renderField(
                                'Address Line 2',
                                formData.address.addressLine2,
                            )}
                        </div>
                        {renderField('City', formData.address.city)}
                        {renderField('State', formData.address.state)}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b border-border flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-semibold text-primary">
                            Documents
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        {renderDocument(
                            'Aadhaar Number',
                            formData.documents.aadhaarNumber,
                        )}
                        {renderDocument(
                            'PAN Number',
                            formData.documents.panNumber,
                        )}
                        {renderDocument(
                            'Address Proof',
                            formData.documents.addressProofType,
                        )}
                        {renderDocument(
                            'Passport Photo',
                            formData.documents.passportPhotoName,
                            true,
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <PageShell
            navbarState="form"
            formStep={{
                current: currentStep,
                total: steps.length,
                label: sectionTitle,
            }}
            savedAt={savedAt || 'Not saved yet'}
            contentClassName="max-w-2xl animate-fade-in"
        >
            <SurfaceCard className="p-8">
                <div className="flex items-center justify-between mb-10">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center flex-1"
                        >
                            <button
                                type="button"
                                onClick={() => goToPastStep(i + 1)}
                                disabled={i + 1 >= currentStep}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                                    i < currentStep - 1
                                        ? 'bg-success text-success-foreground'
                                        : i === currentStep - 1
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-secondary text-muted-foreground'
                                } ${
                                    i + 1 < currentStep
                                        ? 'cursor-pointer'
                                        : 'cursor-default'
                                }`}
                            >
                                {i + 1}
                            </button>
                            <span
                                className={`text-xs font-medium text-center ${
                                    i === currentStep - 1
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {step}
                            </span>
                        </div>
                    ))}
                </div>

                <div key={currentStep}>{renderStepContent()}</div>

                <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={goBack}
                        disabled={currentStep === 1}
                    >
                        Back
                    </Button>
                    <Button size="lg" onClick={goNext}>
                        {currentStep === steps.length
                            ? 'Save & Continue'
                            : 'Next Step'}
                    </Button>
                </div>
            </SurfaceCard>
        </PageShell>
    )
}
