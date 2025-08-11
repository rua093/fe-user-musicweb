'use client'

import { useLikeRefresh } from '@/utils/hooks/useLikeRefresh';

export default function LikeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Auto refresh when like status changes
    useLikeRefresh();

    return (
        <>
            {children}
        </>
    );
}
