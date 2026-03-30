'use client'

import { useEffect, useMemo, useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import SurfaceCard from '@/components/common/SurfaceCard'
import Button from '@/components/common/Button'
import Link from 'next/link'
import ProgressBar from '@/components/common/ProgressBar'
import { notify } from '@/lib/utils'
import axios from 'axios'

type DashboardApplication = {
    id: string
    arn: string
    status: string
    current_step: number
    created_at: string
    applicant_name: string
}

const TOTAL_EDITABLE_STEPS = 4

export default function DashboardPage() {
    const [applications, setApplications] = useState<DashboardApplication[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const response = await axios.get('/api/form/all')
                const appList = response.data?.applications

                setApplications(Array.isArray(appList) ? appList : [])
            } catch (error) {
                const typedError = error as {
                    response?: { data?: { detail?: string } }
                    message?: string
                }
                notify.error(
                    typedError.response?.data?.detail ||
                        typedError.message ||
                        'Failed to load your applications.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadApplications()
    }, [])

    const pendingApplications = useMemo(
        () => applications.filter((app) => app.status !== 'SUBMITTED'),
        [applications],
    )

    const submittedApplications = useMemo(
        () => applications.filter((app) => app.status === 'SUBMITTED'),
        [applications],
    )

    const getDisplayStep = (currentStep: number) =>
        Math.min(stepsCount, Math.max(1, currentStep || 1))

    const getProgress = (currentStep: number) => {
        const step = getDisplayStep(currentStep)
        const percentage = ((step - 1) / TOTAL_EDITABLE_STEPS) * 100
        return Math.max(0, Math.min(100, percentage))
    }

    const formatDate = (isoDate: string) => {
        try {
            return new Date(isoDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
        } catch {
            return 'N/A'
        }
    }

    const stepsCount = 5

    return (
        <PageShell
            navbarState="dashboard"
            contentClassName="max-w-3xl animate-fade-in"
        >
            <h1 className="mb-8">My Dashboard</h1>

            <h2 className="text-lg font-semibold mb-4">Pending Applications</h2>
            {isLoading ? (
                <SurfaceCard className="p-6 mb-10">
                    <p className="text-sm text-muted-foreground">
                        Loading applications...
                    </p>
                </SurfaceCard>
            ) : pendingApplications.length === 0 ? (
                <SurfaceCard className="p-6 mb-10">
                    <p className="text-sm text-muted-foreground">
                        No pending applications found.
                    </p>
                </SurfaceCard>
            ) : (
                <div className="space-y-4 mb-10">
                    {pendingApplications.map((app) => {
                        const displayStep = getDisplayStep(app.current_step)
                        const progress = getProgress(app.current_step)
                        return (
                            <SurfaceCard key={app.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {app.applicant_name ||
                                                'Application Draft'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            ARN: {app.arn}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Started {formatDate(app.created_at)}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium bg-amber/15 text-amber px-3 py-1 rounded-full">
                                        {app.status}
                                    </span>
                                </div>
                                <ProgressBar
                                    value={progress}
                                    className="mb-3"
                                />
                                <p className="text-sm text-muted-foreground mb-5">
                                    {Math.round(progress)}% complete — currently
                                    on step {displayStep}
                                </p>
                                <Link
                                    href={`/form?applicationId=${app.id}&step=${displayStep}`}
                                >
                                    <Button>Continue Application</Button>
                                </Link>
                            </SurfaceCard>
                        )
                    })}
                </div>
            )}

            <h2 className="text-lg font-semibold mb-4">
                Submitted Applications
            </h2>
            {isLoading ? (
                <SurfaceCard className="p-6">
                    <p className="text-sm text-muted-foreground">
                        Loading applications...
                    </p>
                </SurfaceCard>
            ) : submittedApplications.length === 0 ? (
                <SurfaceCard className="p-6">
                    <p className="text-sm text-muted-foreground">
                        No submitted applications found.
                    </p>
                </SurfaceCard>
            ) : (
                <div className="space-y-4">
                    {submittedApplications.map((app) => (
                        <SurfaceCard key={app.id} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">
                                        {app.applicant_name ||
                                            'Passport Application'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        ARN: {app.arn}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Submitted application started on{' '}
                                        {formatDate(app.created_at)}
                                    </div>
                                </div>
                                <span className="text-xs font-medium bg-success/15 text-success px-3 py-1 rounded-full">
                                    SUBMITTED
                                </span>
                            </div>
                        </SurfaceCard>
                    ))}
                </div>
            )}
        </PageShell>
    )
}
