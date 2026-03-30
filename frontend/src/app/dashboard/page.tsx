"use client"

import { useEffect, useMemo, useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import SurfaceCard from '@/components/common/SurfaceCard'
import Button from '@/components/common/Button'
import Link from 'next/link'
import ProgressBar from '@/components/common/ProgressBar'
import { CheckCircle2, Circle } from 'lucide-react'
import axios from 'axios'

type Application = {
    id: string
    arn: string
    status: string
    current_step: number
    created_at: string
    applicant_name: string
}

export default function DashboardPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')

    useEffect(() => {
        const loadApplications = async () => {
            try {
                setIsLoading(true)
                setLoadError('')

                const res = await axios.get('/api/form/all')
                const list = Array.isArray(res.data?.applications)
                    ? res.data.applications
                    : []

                setApplications(list)
            } catch (error) {
                const typedError = error as {
                    response?: { data?: { detail?: string } }
                }
                setLoadError(
                    typedError.response?.data?.detail ||
                        'Unable to load applications at the moment.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        void loadApplications()
    }, [])

    const pendingApplications = useMemo(
        () => applications.filter((app) => app.status === 'DRAFT'),
        [applications],
    )

    const submittedApplications = useMemo(
        () => applications.filter((app) => app.status !== 'DRAFT'),
        [applications],
    )

    const getProgressValue = (currentStep: number) => {
        const value = ((currentStep - 1) / 4) * 100
        return Math.max(0, Math.min(100, value))
    }

    return (
        <PageShell
            navbarState="dashboard"
            contentClassName="max-w-3xl animate-fade-in"
        >
            <h1 className="mb-8">My Dashboard</h1>

            {isLoading ? (
                <SurfaceCard className="p-6 mb-10">
                    <p className="text-sm text-muted-foreground">
                        Loading applications...
                    </p>
                </SurfaceCard>
            ) : (
                <>
                    <h2 className="text-lg font-semibold mb-4">
                        Pending Applications
                    </h2>

                    {pendingApplications.length === 0 ? (
                        <SurfaceCard className="p-6 mb-10">
                            <p className="text-sm text-muted-foreground">
                                No pending applications found.
                            </p>
                        </SurfaceCard>
                    ) : (
                        <div className="space-y-4 mb-10">
                            {pendingApplications.map((app) => (
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
                                                Started{' '}
                                                {new Date(
                                                    app.created_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium bg-amber/15 text-amber px-3 py-1 rounded-full">
                                            {app.status}
                                        </span>
                                    </div>

                                    <ProgressBar
                                        value={getProgressValue(
                                            app.current_step,
                                        )}
                                        className="mb-3"
                                    />

                                    <p className="text-sm text-muted-foreground mb-5">
                                        {Math.round(
                                            getProgressValue(app.current_step),
                                        )}
                                        % complete
                                    </p>

                                    <Link
                                        href={`/form?applicationId=${app.id}&step=1`}
                                    >
                                        <Button>Resume Application</Button>
                                    </Link>
                                </SurfaceCard>
                            ))}
                        </div>
                    )}

                    <h2 className="text-lg font-semibold mb-4">
                        Submitted Applications
                    </h2>
                    {submittedApplications.length === 0 ? (
                        <SurfaceCard className="p-6">
                            <p className="text-sm text-muted-foreground">
                                No submitted applications found.
                            </p>
                        </SurfaceCard>
                    ) : (
                        <SurfaceCard className="p-6">
                            <div className="space-y-4 pl-4 border-l-2 border-border">
                                {submittedApplications.map((item, i) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start gap-3 relative"
                                    >
                                        <div className="absolute -left-[1.35rem] bg-background">
                                            {item.status === 'SUBMITTED' ||
                                            item.status === 'UNDER_REVIEW' ||
                                            item.status === 'APPROVED' ? (
                                                <CheckCircle2 className="w-4 h-4 text-success" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-muted" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">
                                                {item.applicant_name ||
                                                    'Application'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                ARN: {item.arn}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Status: {item.status}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Submitted on{' '}
                                                {new Date(
                                                    item.created_at,
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SurfaceCard>
                    )}
                </>
            )}

            {loadError ? (
                <p className="text-sm text-destructive mt-4">{loadError}</p>
            ) : null}
        </PageShell>
    )
}
